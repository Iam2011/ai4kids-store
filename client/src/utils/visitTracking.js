import { trackVisitActivity } from "../api/storeApi.js";

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
    source: normalizeValue(params.get("utm_source")),
    medium: normalizeValue(params.get("utm_medium")),
    campaign: normalizeValue(params.get("utm_campaign")),
    content: normalizeValue(params.get("utm_content")),
    term: normalizeValue(params.get("utm_term")),
  };
};

const buildPageLabel = (path = "") => {
  const pathname = normalizeValue(path).split("?")[0] || "/";

  if (pathname === "/") return "Homepage";
  if (pathname === "/products") return "Products";
  if (pathname.startsWith("/products/")) return "Product Page";
  if (pathname === "/cart") return "Cart";
  if (pathname === "/checkout") return "Checkout";
  if (pathname.startsWith("/order-success/")) return "Order Success";
  if (pathname.startsWith("/cod-success/")) return "COD Success";
  if (pathname === "/payment-failure") return "Payment Failed";
  if (pathname === "/about") return "About";
  if (pathname.startsWith("/admin")) return "Admin";

  return "Other";
};

const buildAttributionSnapshot = () => ({
  rawReferrer: normalizeValue(document.referrer),
  rawUTM: parseUtmFromLocation(),
  landingPath: `${window.location.pathname}${window.location.search}`,
  landingPageLabel: buildPageLabel(`${window.location.pathname}${window.location.search}`),
});

export const getVisitSessionId = () => {
  const existing = window.localStorage.getItem(VISIT_SESSION_KEY);

  if (existing) {
    return existing;
  }

  const sessionId = generateSessionId();
  window.localStorage.setItem(VISIT_SESSION_KEY, sessionId);
  return sessionId;
};

export const getAttributionSnapshot = () => {
  const stored = window.localStorage.getItem(ATTRIBUTION_SNAPSHOT_KEY);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      window.localStorage.removeItem(ATTRIBUTION_SNAPSHOT_KEY);
    }
  }

  const snapshot = buildAttributionSnapshot();
  window.localStorage.setItem(ATTRIBUTION_SNAPSHOT_KEY, JSON.stringify(snapshot));
  return snapshot;
};

export const getAnalyticsSnapshotForOrder = () => {
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

const persistAttributionResult = (payload, responseMeta = {}) => {
  const previous = getAttributionSnapshot();
  const snapshot = {
    ...previous,
    rawReferrer: normalizeValue(payload.rawReferrer || previous.rawReferrer),
    rawUTM: payload.rawUTM || previous.rawUTM,
    landingPath: previous.landingPath || payload.path,
    landingPageLabel: previous.landingPageLabel || payload.pageLabel,
    sourceLabel: responseMeta.sourceLabel || previous.sourceLabel || "",
    sourceType: responseMeta.sourceType || previous.sourceType || "",
    campaignLabel: responseMeta.campaignLabel || previous.campaignLabel || "",
  };

  window.localStorage.setItem(ATTRIBUTION_SNAPSHOT_KEY, JSON.stringify(snapshot));
};

export const trackStoreEvent = async ({
  eventType,
  path = `${window.location.pathname}${window.location.search}`,
  pageLabel = buildPageLabel(path),
  isLandingPage = false,
  product = null,
  category = null,
  searchTerm = "",
  paymentOption = "",
  order = null,
}) => {
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

  const response = await trackVisitActivity(payload);
  persistAttributionResult(payload, response || {});
  return response;
};

export const sendVisitEvent = ({ path, referrer = "" }) => {
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
      if (referrer && !window.localStorage.getItem(ATTRIBUTION_SNAPSHOT_KEY)) {
        const snapshot = buildAttributionSnapshot();
        snapshot.rawReferrer = referrer;
        window.localStorage.setItem(ATTRIBUTION_SNAPSHOT_KEY, JSON.stringify(snapshot));
      }
    })
    .catch(() => {
      window.sessionStorage.setItem(LAST_ROUTE_KEY, path);
    });
};

export const trackOrderPlacedOnce = async ({ orderNumber, orderValue = 0, paymentOption = "" }) => {
  if (!orderNumber) return;

  const storageKey = `${ORDER_TRACKED_PREFIX}${orderNumber}`;
  if (window.sessionStorage.getItem(storageKey) === "true") {
    return;
  }

  try {
    await trackStoreEvent({
      eventType: "order_placed",
      path: `${window.location.pathname}${window.location.search}`,
      pageLabel: buildPageLabel(`${window.location.pathname}${window.location.search}`),
      order: {
        orderNumber,
        orderValue,
      },
      paymentOption,
    });
    window.sessionStorage.setItem(storageKey, "true");
  } catch {
    // order placed analytics is best-effort and should never block success page rendering
  }
};

export const analyticsHelpers = {
  buildPageLabel,
};
