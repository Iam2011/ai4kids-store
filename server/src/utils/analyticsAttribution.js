const normalizeValue = (value = "") => String(value || "").trim();
const normalizeLower = (value = "") => normalizeValue(value).toLowerCase();

export const parsePageLabel = (path = "") => {
  const normalizedPath = normalizeValue(path).split("?")[0] || "/";

  if (normalizedPath === "/") return "Homepage";
  if (normalizedPath === "/products") return "Products";
  if (normalizedPath.startsWith("/products/")) return "Product Page";
  if (normalizedPath === "/cart") return "Cart";
  if (normalizedPath === "/checkout") return "Checkout";
  if (normalizedPath.startsWith("/order-success/")) return "Order Success";
  if (normalizedPath.startsWith("/cod-success/")) return "COD Success";
  if (normalizedPath === "/payment-failure") return "Payment Failed";
  if (normalizedPath === "/about") return "About";
  if (normalizedPath === "/privacy-policy") return "Privacy Policy";
  if (normalizedPath === "/return-refund-policy") return "Return & Refund";
  if (normalizedPath === "/shipping-policy") return "Shipping Policy";
  if (normalizedPath.startsWith("/admin")) return "Admin";

  return "Other";
};

const buildRawUtm = (rawUTM = {}) => ({
  source: normalizeValue(rawUTM?.source),
  medium: normalizeValue(rawUTM?.medium),
  campaign: normalizeValue(rawUTM?.campaign),
  content: normalizeValue(rawUTM?.content),
  term: normalizeValue(rawUTM?.term),
});

export const classifyAttribution = ({ rawUTM = {}, rawReferrer = "" } = {}) => {
  const normalizedUTM = buildRawUtm(rawUTM);
  const utmSource = normalizeLower(normalizedUTM.source);
  const utmMedium = normalizeLower(normalizedUTM.medium);
  const utmCampaign = normalizeValue(normalizedUTM.campaign);
  const referrer = normalizeLower(rawReferrer);

  if (utmSource || utmMedium || utmCampaign) {
    if ((utmSource === "instagram" || utmSource === "ig") && /paid|cpc|ads?|meta/.test(utmMedium)) {
      return {
        sourceLabel: "Instagram Paid",
        sourceType: "Paid",
        campaignLabel: utmCampaign || "Instagram Paid",
        rawUTM: normalizedUTM,
      };
    }

    if (utmSource === "instagram" || utmSource === "ig") {
      return {
        sourceLabel: "Instagram Organic",
        sourceType: "Organic",
        campaignLabel: utmCampaign || "Instagram Organic",
        rawUTM: normalizedUTM,
      };
    }

    if (utmSource === "whatsapp" || utmSource === "wa" || utmSource === "wa.me") {
      return {
        sourceLabel: "WhatsApp",
        sourceType: "Social",
        campaignLabel: utmCampaign || "WhatsApp",
        rawUTM: normalizedUTM,
      };
    }

    if (utmSource === "google") {
      return {
        sourceLabel: "Google",
        sourceType: /paid|cpc|ppc|ads?/.test(utmMedium) ? "Paid" : "Organic",
        campaignLabel: utmCampaign || "Google",
        rawUTM: normalizedUTM,
      };
    }

    if (utmSource === "facebook" || utmSource === "fb" || utmSource === "m.facebook.com") {
      return {
        sourceLabel: "Facebook",
        sourceType: /paid|cpc|ads?|meta/.test(utmMedium) ? "Paid" : "Social",
        campaignLabel: utmCampaign || "Facebook",
        rawUTM: normalizedUTM,
      };
    }

    return {
      sourceLabel: utmCampaign || normalizeValue(normalizedUTM.source) || "Campaign",
      sourceType: /paid|cpc|ppc|ads?/.test(utmMedium) ? "Paid" : "Referral",
      campaignLabel: utmCampaign || normalizeValue(normalizedUTM.source) || "Campaign",
      rawUTM: normalizedUTM,
    };
  }

  if (referrer) {
    if (referrer.includes("instagram.com")) {
      return {
        sourceLabel: "Instagram Organic",
        sourceType: "Organic",
        campaignLabel: "Instagram Organic",
        rawUTM: normalizedUTM,
      };
    }

    if (referrer.includes("whatsapp") || referrer.includes("wa.me")) {
      return {
        sourceLabel: "WhatsApp",
        sourceType: "Social",
        campaignLabel: "WhatsApp",
        rawUTM: normalizedUTM,
      };
    }

    if (referrer.includes("google.")) {
      return {
        sourceLabel: "Google",
        sourceType: "Organic",
        campaignLabel: "Google",
        rawUTM: normalizedUTM,
      };
    }

    if (referrer.includes("facebook.com")) {
      return {
        sourceLabel: "Facebook",
        sourceType: "Social",
        campaignLabel: "Facebook",
        rawUTM: normalizedUTM,
      };
    }

    return {
      sourceLabel: "Referral",
      sourceType: "Referral",
      campaignLabel: "Referral",
      rawUTM: normalizedUTM,
    };
  }

  return {
    sourceLabel: "Direct",
    sourceType: "Direct",
    campaignLabel: "Direct",
    rawUTM: normalizedUTM,
  };
};

export const buildLandingLabel = ({ pageLabel = "", sourceLabel = "" } = {}) =>
  [normalizeValue(pageLabel), normalizeValue(sourceLabel)].filter(Boolean).join(" - ");
