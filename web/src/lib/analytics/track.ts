"use client";

import { buildPageLabel } from "@/lib/utils/page-labels";
import type { AnalyticsSnapshot, TrackedEventType } from "@/types/analytics";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ai4kids-api.onrender.com/api";
const VISIT_SESSION_KEY = "ai4kids-visit-session";
const ATTRIBUTION_SNAPSHOT_KEY = "ai4kids-attribution-snapshot";
const LAST_ROUTE_KEY = "ai4kids-last-route";
const LANDING_TRACKED_KEY = "ai4kids-landing-tracked";
const ORDER_TRACKED_PREFIX = "ai4kids-order-tracked:";

const generateSessionId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `visit_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const normalizeValue = (value = "") => String(value || "").trim();

const parseUtmFromLocation = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    source: normalizeValue(params.get("utm_source") || ""),
    medium: normalizeValue(params.get("utm_medium") || ""),
    campaign: normalizeValue(params.get("utm_campaign") || ""),
    content: normalizeValue(params.get("utm_content") || ""),
    term: normalizeValue(params.get("utm_term") || ""),
  };
};

const buildAttributionSnapshot = () => ({
  rawReferrer: normalizeValue(document.referrer),
  rawUTM: parseUtmFromLocation(),
  landingPath: `${window.location.pathname}${window.location.search}`,
  landingPageLabel: buildPageLabel(`${window.location.pathname}${window.location.search}`),
});

export const getVisitSessionId = () => {
  const existing = window.localStorage.getItem(VISIT_SESSION_KEY);
  if (existing) return existing;
  const sessionId = generateSessionId();
  window.localStorage.setItem(VISIT_SESSION_KEY, sessionId);
  return sessionId;
};

export const getAttributionSnapshot = (): AnalyticsSnapshot => {
  const stored = window.localStorage.getItem(ATTRIBUTION_SNAPSHOT_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as AnalyticsSnapshot;
    } catch {
      window.localStorage.removeItem(ATTRIBUTION_SNAPSHOT_KEY);
    }
  }

  const snapshot = buildAttributionSnapshot();
  window.localStorage.setItem(ATTRIBUTION_SNAPSHOT_KEY, JSON.stringify(snapshot));
  return snapshot as AnalyticsSnapshot;
};

const persistAttributionResult = (payload: Record<string, unknown>, responseMeta: Record<string, unknown> = {}) => {
  const previous = getAttributionSnapshot();
  const snapshot = {
    ...previous,
    rawReferrer: normalizeValue((payload.rawReferrer as string) || previous.rawReferrer),
    rawUTM: (payload.rawUTM as AnalyticsSnapshot["rawUTM"]) || previous.rawUTM,
    landingPath: previous.landingPath || (payload.path as string),
    landingPageLabel: previous.landingPageLabel || (payload.pageLabel as string),
    sourceLabel: String(responseMeta.sourceLabel || previous.sourceLabel || ""),
    sourceType: String(responseMeta.sourceType || previous.sourceType || ""),
    campaignLabel: String(responseMeta.campaignLabel || previous.campaignLabel || ""),
  };

  window.localStorage.setItem(ATTRIBUTION_SNAPSHOT_KEY, JSON.stringify(snapshot));
};

export const getAnalyticsSnapshotForOrder = (): AnalyticsSnapshot => {
  const snapshot = getAttributionSnapshot();
  return {
    sessionId: getVisitSessionId(),
    sourceLabel: snapshot.sourceLabel || "",
    sourceType: snapshot.sourceType || "",
    campaignLabel: snapshot.campaignLabel || "",
    rawReferrer: snapshot.rawReferrer || "",
    rawUTM: snapshot.rawUTM || {},
    landingPath: snapshot.landingPath || "",
    landingPageLabel: snapshot.landingPageLabel || "",
  };
};

export async function trackStoreEvent({
  eventType,
  path = `${window.location.pathname}${window.location.search}`,
  pageLabel = buildPageLabel(path),
  isLandingPage = false,
  product = null,
  category = null,
  searchTerm = "",
  paymentOption = "",
  order = null,
}: {
  eventType: TrackedEventType;
  path?: string;
  pageLabel?: string;
  isLandingPage?: boolean;
  product?: Record<string, unknown> | null;
  category?: Record<string, unknown> | null;
  searchTerm?: string;
  paymentOption?: string;
  order?: Record<string, unknown> | null;
}) {
  const sessionId = getVisitSessionId();
  const attribution = getAttributionSnapshot();

  const payload = {
    eventType,
    sessionId,
    timestamp: new Date().toISOString(),
    path,
    pageLabel,
    isLandingPage,
    referrer: window.sessionStorage.getItem(LAST_ROUTE_KEY) || attribution.rawReferrer || "",
    rawReferrer: attribution.rawReferrer || "",
    rawUTM: attribution.rawUTM || {},
    product,
    category,
    searchTerm,
    paymentOption,
    order,
  };

  const response = await fetch(`${API_URL}/analytics/visit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Analytics request failed.");
  }

  const meta = (await response.json()) as Record<string, unknown>;
  persistAttributionResult(payload, meta);
  return meta;
}

export const sendVisitEvent = ({ path }: { path: string }) => {
  const alreadyTrackedLanding = window.sessionStorage.getItem(LANDING_TRACKED_KEY) === "true";
  const isLandingPage = !alreadyTrackedLanding;

  trackStoreEvent({
    eventType: "page_view",
    path,
    pageLabel: buildPageLabel(path),
    isLandingPage,
  })
    .then(() => {
      if (isLandingPage) {
        window.sessionStorage.setItem(LANDING_TRACKED_KEY, "true");
      }
      window.sessionStorage.setItem(LAST_ROUTE_KEY, path);
    })
    .catch(() => {
      window.sessionStorage.setItem(LAST_ROUTE_KEY, path);
    });
};

export const trackOrderPlacedOnce = async ({
  orderNumber,
  orderValue = 0,
  paymentOption = "",
}: {
  orderNumber: string;
  orderValue?: number;
  paymentOption?: string;
}) => {
  if (!orderNumber) return;
  const storageKey = `${ORDER_TRACKED_PREFIX}${orderNumber}`;
  if (window.sessionStorage.getItem(storageKey) === "true") return;

  try {
    await trackStoreEvent({
      eventType: "order_placed",
      order: {
        orderNumber,
        orderValue,
      },
      paymentOption,
    });
    window.sessionStorage.setItem(storageKey, "true");
  } catch {
    // best effort only
  }
};
