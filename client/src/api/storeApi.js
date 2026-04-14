import { apiClient } from "./apiClient";

const productsCache = new Map();
const PRODUCTS_CACHE_TTL_MS = 60_000;

const buildCacheKey = (params) => {
  const entries = Object.entries(params || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right));

  return entries.map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`).join("&");
};

export const getProducts = async (params = {}) => {
  const cacheKey = buildCacheKey(params);
  const now = Date.now();
  const cached = productsCache.get(cacheKey);

  if (cached && now - cached.at < PRODUCTS_CACHE_TTL_MS) {
    return cached.data;
  }

  const { data } = await apiClient.get("/products", { params });
  productsCache.set(cacheKey, { at: now, data });
  return data;
};

export const clearProductsCache = () => {
  productsCache.clear();
};

export const getProduct = async (slug) => {
  const { data } = await apiClient.get(`/products/${slug}`);
  return data;
};

export const validateCoupon = async (payload) => {
  const { data } = await apiClient.post("/coupons/validate", payload);
  return data;
};

export const createPaymentOrder = async (payload) => {
  const { data } = await apiClient.post("/payments/create-order", payload);
  return data;
};

export const verifyPayment = async (payload) => {
  const { data } = await apiClient.post("/payments/verify", payload);
  return data;
};

export const markPaymentFailure = async (payload) => {
  const { data } = await apiClient.post("/payments/failure", payload);
  return data;
};

export const lookupPincode = async (pincode) => {
  const { data } = await apiClient.get(`/location/pincode/${pincode}`);
  return data;
};

export const getOrder = async (orderNumber) => {
  const { data } = await apiClient.get(`/orders/${orderNumber}`);
  return data;
};

export const adminLogin = async (payload) => {
  const { data } = await apiClient.post("/admin/login", payload);
  return data;
};

const withAdminAuth = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getAdminSummary = async (token) => {
  const { data } = await apiClient.get("/admin/summary", withAdminAuth(token));
  return data;
};

export const getAdminOrders = async (token) => {
  const { data } = await apiClient.get("/admin/orders", withAdminAuth(token));
  return data;
};

export const getAdminProducts = async (token) => {
  const { data } = await apiClient.get("/admin/products", withAdminAuth(token));
  return data;
};

export const createAdminProduct = async (token, payload) => {
  const { data } = await apiClient.post("/admin/products", payload, withAdminAuth(token));
  clearProductsCache();
  return data;
};

export const updateAdminProduct = async (token, productId, payload) => {
  const { data } = await apiClient.put(
    `/admin/products/${productId}`,
    payload,
    withAdminAuth(token)
  );
  clearProductsCache();
  return data;
};

export const importAdminCatalog = async (token, file) => {
  const arrayBuffer = await file.arrayBuffer();
  const { data } = await apiClient.post("/admin/products/import", arrayBuffer, {
    ...withAdminAuth(token),
    headers: {
      ...withAdminAuth(token).headers,
      "Content-Type": "application/octet-stream",
      "X-Upload-Filename": file.name,
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  clearProductsCache();
  return data;
};

export const downloadAdminOrdersExport = async (token, format = "csv") => {
  const { data, headers } = await apiClient.get(`/admin/orders/export.${format}`, {
    ...withAdminAuth(token),
    responseType: "blob",
  });

  return {
    blob: data,
    filename:
      headers["content-disposition"]?.match(/filename="?([^"]+)"?/i)?.[1] ||
      `ai4kids-orders.${format === "csv" ? "csv" : "xls"}`,
  };
};

export const getAdminVisitAnalytics = async (token) => {
  const { data } = await apiClient.get("/admin/analytics/visits", withAdminAuth(token));
  return data;
};

export const trackVisitActivity = async (payload) => {
  const { data } = await apiClient.post("/analytics/visit", payload);
  return data;
};
