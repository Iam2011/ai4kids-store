import type { CheckoutPayload, PaymentOrderResponse } from "@/types/checkout";
import { apiFetch } from "./client";

export const validateCoupon = (payload: {
  couponCode: string;
  subtotal: number;
  paymentMode: string;
}) =>
  apiFetch<{
    code: string;
    discountAmount: number;
    allowOnCod?: boolean;
    allowOnFull?: boolean;
  }>("/coupons/validate", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const lookupPincode = (pincode: string) =>
  apiFetch<{ city: string; state: string }>(`/location/pincode/${pincode}`);

export const createPaymentOrder = (payload: CheckoutPayload) =>
  apiFetch<PaymentOrderResponse>("/payments/create-order", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const verifyPayment = (payload: Record<string, unknown>) =>
  apiFetch<{ success: boolean; orderNumber: string }>("/payments/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const markPaymentFailure = (payload: Record<string, unknown>) =>
  apiFetch<{ success: boolean }>("/payments/failure", {
    method: "POST",
    body: JSON.stringify(payload),
  });
