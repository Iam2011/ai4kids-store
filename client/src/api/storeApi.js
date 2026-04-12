import { apiClient } from "./apiClient";

export const getProducts = async (params = {}) => {
  const { data } = await apiClient.get("/products", { params });
  return data;
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
  return data;
};

export const updateAdminProduct = async (token, productId, payload) => {
  const { data } = await apiClient.put(
    `/admin/products/${productId}`,
    payload,
    withAdminAuth(token)
  );
  return data;
};
