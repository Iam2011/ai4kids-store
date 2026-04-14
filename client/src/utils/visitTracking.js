import { trackVisitActivity } from "../api/storeApi.js";

const VISIT_SESSION_KEY = "ai4kids-visit-session";

const generateSessionId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `visit_${Date.now()}_${Math.random().toString(16).slice(2)}`;

export const getVisitSessionId = () => {
  const existing = window.localStorage.getItem(VISIT_SESSION_KEY);

  if (existing) {
    return existing;
  }

  const sessionId = generateSessionId();
  window.localStorage.setItem(VISIT_SESSION_KEY, sessionId);
  return sessionId;
};

export const sendVisitEvent = ({ path, referrer = "" }) => {
  const sessionId = getVisitSessionId();

  trackVisitActivity({
    sessionId,
    path,
    referrer,
  }).catch(() => {
    // Visit tracking is best-effort and should never block storefront navigation.
  });
};
