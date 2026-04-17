"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/cart-provider";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { TrustMarkers } from "@/components/trust/trust-markers";
import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { createPaymentOrder, lookupPincode, markPaymentFailure, verifyPayment } from "@/lib/api/checkout";
import { ApiError } from "@/lib/api/client";
import { getPreviewTotal } from "@/lib/utils/pricing";
import { getAnalyticsSnapshotForOrder, trackStoreEvent } from "@/lib/analytics/track";
import { loadRazorpayScript } from "@/lib/utils/payment";
import type { CheckoutCustomer, PaymentMode } from "@/types/checkout";

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    description?: string;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (eventName: "payment.failed", handler: (response: RazorpayFailureResponse) => void) => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  prefill: {
    name: string;
    contact: string;
  };
  notes: {
    orderNumber: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpaySuccessResponse) => Promise<void>;
  modal: {
    ondismiss: () => Promise<void>;
  };
};

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

const initialForm: CheckoutCustomer = {
  name: "",
  mobile: "",
  address: "",
  pincode: "",
  city: "",
  state: "",
};

const generateCheckoutToken = () =>
  globalThis.crypto?.randomUUID?.() ||
  `checkout_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const validateCheckoutForm = (form: CheckoutCustomer) => {
  if (String(form.name || "").trim().length < 2) return "Enter the customer name.";
  if (!/^\d{10}$/.test(String(form.mobile || "").replace(/\D+/g, ""))) return "Enter a valid 10-digit mobile number.";
  if (String(form.address || "").trim().length < 8) return "Enter the full delivery address.";
  if (!/^\d{6}$/.test(String(form.pincode || "").replace(/\D+/g, ""))) return "Enter a valid 6-digit pincode.";
  if (!String(form.city || "").trim() || !String(form.state || "").trim()) return "City and state are required.";
  return "";
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, coupon, clearCart, removeItems } = useCart();
  const [form, setForm] = useState(initialForm);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("full_payment");
  const [lookupMessage, setLookupMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastLookupPincode, setLastLookupPincode] = useState("");
  const [checkoutToken, setCheckoutToken] = useState(generateCheckoutToken);
  const checkoutTrackedRef = useRef(false);

  const couponAllowedForMode = coupon
    ? paymentMode === "cod_deposit"
      ? coupon.allowOnCod !== false
      : coupon.allowOnFull !== false
    : false;
  const discount = couponAllowedForMode ? coupon?.discountAmount || 0 : 0;
  const total = getPreviewTotal(subtotal, discount);
  const paymentAmount = paymentMode === "cod_deposit" ? 0 : total;
  const balanceDue = paymentMode === "cod_deposit" ? total : 0;

  useEffect(() => {
    if (!items.length || checkoutTrackedRef.current) return;
    checkoutTrackedRef.current = true;
    void trackStoreEvent({ eventType: "checkout_started" }).catch(() => {});
  }, [items.length]);

  useEffect(() => {
    if (form.pincode.length !== 6 || form.pincode === lastLookupPincode) return;

    const fetchPincode = async () => {
      setLookupMessage("Looking up pincode...");
      try {
        const data = await lookupPincode(form.pincode);
        setForm((current) => ({
          ...current,
          city: data.city || current.city,
          state: data.state || current.state,
        }));
        setLookupMessage(`Auto-filled ${data.city}, ${data.state}`);
        setLastLookupPincode(form.pincode);
      } catch {
        setLookupMessage("Unable to auto-fill this pincode.");
      }
    };

    void fetchPincode();
  }, [form.pincode, lastLookupPincode]);

  if (!items.length) {
    return (
      <PageContainer>
        <EmptyState title="Nothing to checkout yet" text="Add products first so we can create your order." />
      </PageContainer>
    );
  }

  const handleChange = (name: keyof CheckoutCustomer, nextValue: string) => {
    const value = name === "mobile" || name === "pincode" ? nextValue.replace(/\D+/g, "") : nextValue;
    setForm((current) => ({ ...current, [name]: value }));
    if (name === "pincode" && value.length < 6) {
      setLastLookupPincode("");
      setLookupMessage("");
    }
  };

  const selectPaymentMode = (mode: PaymentMode) => {
    setPaymentMode(mode);
    void trackStoreEvent({
      eventType: "payment_option_selected",
      paymentOption: mode === "cod_deposit" ? "Cash on Delivery" : "Pay Now",
    }).catch(() => {});
  };

  const handlePayment = async () => {
    const validationMessage = validateCheckoutForm(form);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const order = await createPaymentOrder({
        customer: form,
        cartItems: items.map((item) => ({
          productId: item.itemType === "product" ? item.productId : "",
          comboKey: item.itemType === "combo" ? item.comboKey : "",
          quantity: item.quantity,
        })),
        couponCode: couponAllowedForMode ? coupon?.code || "" : "",
        paymentMode,
        checkoutToken,
        analyticsSnapshot: getAnalyticsSnapshotForOrder(),
      });

      if (order.paymentGateway === "mock") {
        await verifyPayment({
          orderId: order.orderId,
          razorpay_order_id: order.razorpayOrderId,
          razorpay_payment_id: `mock_payment_${Date.now()}`,
          razorpay_signature: "mock_signature",
          isMock: true,
        });
        clearCart();
        setCheckoutToken(generateCheckoutToken());
        router.push(
          paymentMode === "cod_deposit"
            ? `/cod-success/${order.orderNumber}`
            : `/order-success/${order.orderNumber}`
        );
        return;
      }

      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        throw new Error("Unable to load Razorpay checkout.");
      }

      const RazorpayCtor = (window as typeof window & { Razorpay?: RazorpayConstructor }).Razorpay;
      if (!RazorpayCtor) {
        throw new Error("Razorpay checkout is unavailable.");
      }
      const razorpay = new RazorpayCtor({
        key: order.keyId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        name: "AI4Kids",
        description: paymentMode === "cod_deposit" ? "COD confirmation payment" : "Full order payment",
        image: "/logo.png",
        order_id: order.razorpayOrderId,
        prefill: {
          name: form.name,
          contact: form.mobile,
        },
        notes: {
          orderNumber: order.orderNumber,
        },
        theme: {
          color: "#8d72ff",
        },
        handler: async (response: RazorpaySuccessResponse) => {
          await verifyPayment({
            orderId: order.orderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          clearCart();
          setCheckoutToken(generateCheckoutToken());
          router.push(
            paymentMode === "cod_deposit"
              ? `/cod-success/${order.orderNumber}`
              : `/order-success/${order.orderNumber}`
          );
        },
        modal: {
          ondismiss: async () => {
            await markPaymentFailure({
              orderId: order.orderId,
              reason: "Customer closed Razorpay checkout.",
            });
            setSubmitting(false);
            setCheckoutToken(generateCheckoutToken());
            router.push(
              `/payment-failure?orderNumber=${encodeURIComponent(order.orderNumber)}&reason=${encodeURIComponent("Customer closed Razorpay checkout.")}`
            );
          },
        },
      });

      razorpay.on("payment.failed", async (response: RazorpayFailureResponse) => {
        await markPaymentFailure({
          orderId: order.orderId,
          reason: response.error?.description || "Razorpay payment failed.",
        });
        setSubmitting(false);
        setCheckoutToken(generateCheckoutToken());
        router.push(
          `/payment-failure?orderNumber=${encodeURIComponent(order.orderNumber)}&reason=${encodeURIComponent(response.error?.description || "Payment failed.")}`
        );
      });

      razorpay.open();
    } catch (error) {
      if (error instanceof ApiError && error.code === "UNAVAILABLE_PRODUCTS") {
        const unavailableDetails = Array.isArray(error.details) ? error.details : [];
        const unavailableItemKeys = items
          .filter((item) =>
            unavailableDetails.some((detail) => {
              const detailRecord = detail as {
                itemType?: string;
                productId?: string;
                comboKey?: string;
              };

              if (detailRecord.itemType === "combo") {
                return item.itemType === "combo" && item.comboKey === detailRecord.comboKey;
              }

              return item.itemType === "product" && item.productId === detailRecord.productId;
            })
          )
          .map((item) => item.itemKey);

        if (unavailableItemKeys.length) {
          removeItems(unavailableItemKeys);
        }

        setErrorMessage(
          unavailableItemKeys.length
            ? "Unavailable products were removed from your cart. Please review your order and try again."
            : error.message
        );
      } else {
        setErrorMessage(error instanceof Error ? error.message : "Checkout failed.");
      }
      setSubmitting(false);
      setCheckoutToken(generateCheckoutToken());
    }
  };

  return (
    <PageContainer>
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <CheckoutForm value={form} onChange={handleChange} />
          {lookupMessage ? (
            <p className="rounded-[20px] bg-white/90 px-4 py-3 text-sm text-[#6d6790] shadow-[0_18px_40px_rgba(148,123,191,0.12)]">
              {lookupMessage}
            </p>
          ) : null}
        </div>

        <CheckoutSummary
          items={items}
          subtotal={subtotal}
          discount={discount}
          total={total}
          paymentAmount={paymentAmount}
          balanceDue={balanceDue}
          paymentMode={paymentMode}
          onPaymentModeChange={selectPaymentMode}
          onSubmit={handlePayment}
          submitting={submitting}
          errorMessage={errorMessage}
        />
      </div>

      <TrustMarkers />
    </PageContainer>
  );
}
