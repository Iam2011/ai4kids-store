import net from "node:net";
import { GeoCache } from "../models/GeoCache.js";

const privateIpPatterns = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
];

const unknownGeo = {
  city: "Unknown",
  state: "",
  country: "",
};

const normalizeIp = (ip = "") => String(ip || "").replace(/^::ffff:/, "").trim();

const isPrivateIp = (ip = "") =>
  !ip || net.isIP(ip) === 0 || privateIpPatterns.some((pattern) => pattern.test(ip));

export const getClientIp = (req) => {
  const forwarded = String(req.headers["x-forwarded-for"] || "")
    .split(",")
    .map((entry) => normalizeIp(entry))
    .find(Boolean);

  return forwarded || normalizeIp(req.ip || req.socket?.remoteAddress || "");
};

export const resolveGeoForIp = async (ip) => {
  const normalizedIp = normalizeIp(ip);

  if (isPrivateIp(normalizedIp)) {
    return unknownGeo;
  }

  const cached = await GeoCache.findOne({ ip: normalizedIp }).lean();

  if (cached) {
    return {
      city: cached.city || "Unknown",
      state: cached.state || "",
      country: cached.country || "",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(normalizedIp)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return unknownGeo;
    }

    const payload = await response.json();
    const geo = {
      city: String(payload.city || "Unknown").trim() || "Unknown",
      state: String(payload.region || "").trim(),
      country: String(payload.country || "").trim(),
    };

    await GeoCache.findOneAndUpdate(
      { ip: normalizedIp },
      {
        ip: normalizedIp,
        ...geo,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return geo;
  } catch {
    return unknownGeo;
  }
};
