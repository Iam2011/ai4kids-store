import { VisitEvent } from "../models/VisitEvent.js";
import { getClientIp, resolveGeoForIp } from "../services/geoLookupService.js";
import { classifyAttribution, parsePageLabel } from "../utils/analyticsAttribution.js";

const buildDeviceType = (userAgent = "") => {
  const normalized = String(userAgent || "").toLowerCase();

  if (/(ipad|tablet)/.test(normalized)) return "tablet";
  if (/(mobile|android|iphone)/.test(normalized)) return "mobile";
  if (!normalized) return "unknown";
  return "desktop";
};

export const captureVisitEvent = async (req, res) => {
  const sessionId = String(req.body?.sessionId || "").trim();
  const path = String(req.body?.path || "").trim();
  const referrer = String(req.body?.referrer || "").trim();
  const eventType = String(req.body?.eventType || "page_view").trim() || "page_view";
  const pageLabel = String(req.body?.pageLabel || parsePageLabel(path)).trim();
  const isLandingPage = Boolean(req.body?.isLandingPage);
  const attribution = classifyAttribution({
    rawUTM: req.body?.rawUTM || {},
    rawReferrer: req.body?.rawReferrer || referrer,
  });
  const product = req.body?.product || {};
  const category = req.body?.category || {};
  const order = req.body?.order || {};

  if (!sessionId || !path) {
    return res.status(400).json({ message: "sessionId and path are required." });
  }

  const ip = getClientIp(req);
  const geo = await resolveGeoForIp(ip);
  const userAgent = String(req.headers["user-agent"] || "").trim();

  await VisitEvent.create({
    eventType,
    timestamp: req.body?.timestamp ? new Date(req.body.timestamp) : new Date(),
    sessionId,
    path,
    pageLabel,
    isLandingPage,
    referrer,
    rawReferrer: String(req.body?.rawReferrer || referrer || "").trim(),
    userAgent,
    deviceType: buildDeviceType(userAgent),
    ip,
    city: geo.city || "Unknown",
    state: geo.state || "",
    country: geo.country || "",
    sourceLabel: attribution.sourceLabel,
    sourceType: attribution.sourceType,
    campaignLabel: attribution.campaignLabel,
    rawUTM: attribution.rawUTM,
    productId: String(product.productId || product.id || req.body?.productId || "").trim(),
    productName: String(product.productName || req.body?.productName || "").trim(),
    category: String(product.category || req.body?.category || "").trim(),
    categoryLabel: String(category.categoryLabel || req.body?.categoryLabel || "").trim(),
    searchTerm: String(req.body?.searchTerm || "").trim(),
    paymentOption: String(req.body?.paymentOption || "").trim(),
    orderNumber: String(order.orderNumber || req.body?.orderNumber || "").trim(),
    orderValue: Number(order.orderValue || req.body?.orderValue || 0),
  });

  res.status(201).json({
    ok: true,
    sourceLabel: attribution.sourceLabel,
    sourceType: attribution.sourceType,
    campaignLabel: attribution.campaignLabel,
  });
};
