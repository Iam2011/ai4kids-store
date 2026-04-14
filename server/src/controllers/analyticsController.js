import { VisitEvent } from "../models/VisitEvent.js";
import { getClientIp, resolveGeoForIp } from "../services/geoLookupService.js";

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

  if (!sessionId || !path) {
    return res.status(400).json({ message: "sessionId and path are required." });
  }

  const ip = getClientIp(req);
  const geo = await resolveGeoForIp(ip);
  const userAgent = String(req.headers["user-agent"] || "").trim();

  await VisitEvent.create({
    sessionId,
    path,
    referrer,
    userAgent,
    deviceType: buildDeviceType(userAgent),
    ip,
    city: geo.city || "Unknown",
    state: geo.state || "",
    country: geo.country || "",
  });

  res.status(201).json({ ok: true });
};
