import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createPaymentOrder,
  lookupPincode,
  markPaymentFailure,
  verifyPayment,
} from "../api/storeApi.js";
import { TrustMarkers } from "../components/TrustMarkers.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/currency.js";
import { loadRazorpayScript } from "../utils/payment.js";
import { calculateCodConfirmationFee } from "../utils/pricing.js";
import { getAnalyticsSnapshotForOrder, trackStoreEvent } from "../utils/visitTracking.js";

const initialForm = {
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

const validateCheckoutForm = (form) => {
  if (String(form.name || "").trim().length < 2) {
    return "Enter the customer name.";
  }

  if (!/^\d{10}$/.test(String(form.mobile || "").replace(/\D+/g, ""))) {
    return "Enter a valid 10-digit mobile number.";
  }

  if (String(form.address || "").trim().length < 8) {
    return "Enter the full delivery address.";
  }

  if (!/^\d{6}$/.test(String(form.pincode || "").replace(/\D+/g, ""))) {
    return "Enter a valid 6-digit pincode.";
  }

  if (!String(form.city || "").trim() || !String(form.state || "").trim()) {
    return "City and state are required.";
  }

  return "";
};

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, coupon, clearCart } = useCart();
  const [form, setForm] = useState(initialForm);
  const [paymentMode, setPaymentMode] = useState("full_payment");
  const [lookupState, setLookupState] = useState({ loading: false, message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastLookupPincode, setLastLookupPincode] = useState("");
  const [checkoutToken, setCheckoutToken] = useState(generateCheckoutToken);
  const checkoutTrackedRef = useRef(false);
  const paymentSelectionTrackedRef = useRef(false);

  const couponAllowedForMode = coupon
    ? paymentMode === "cod_deposit"
      ? coupon.allowOnCod !== false
      : coupon.allowOnFull !== false
    : false;
  const effectiveCouponCode = couponAllowedForMode ? coupon?.code || "" : "";
  const discount = couponAllowedForMode ? coupon?.discountAmount || 0 : 0;
  const total = Math.max(0, subtotal - discount);
  const codConfirmationFee = calculateCodConfirmationFee(items);
  const paymentAmount =
    paymentMode === "cod_deposit" ? Math.min(total, codConfirmationFee) : total;
  const balanceDue = paymentMode === "cod_deposit" ? Math.max(0, total - paymentAmount) : 0;

  useEffect(() => {
    if (form.pincode.length !== 6 || form.pincode === lastLookupPincode) {
      return;
    }

    const fetchPincode = async () => {
      setLookupState({ loading: true, message: "Looking up pincode..." });

      try {
        const data = await lookupPincode(form.pincode);
        setForm((current) => ({
          ...current,
          city: data.city || current.city,
          state: data.state || current.state,
        }));
        setLookupState({ loading: false, message: `Auto-filled ${data.city}, ${data.state}` });
        setLastLookupPincode(form.pincode);
      } catch (error) {
        setLookupState({
          loading: false,
          message: error.response?.data?.message || "Unable to auto-fill this pincode.",
        });
      }
    };

    fetchPincode();
  }, [form.pincode, lastLookupPincode]);

  useEffect(() => {
    if (!items.length || checkoutTrackedRef.current) {
      return;
    }

    checkoutTrackedRef.current = true;
    trackStoreEvent({
      eventType: "checkout_started",
    }).catch(() => {});
  }, [items.length]);

  useEffect(() => {
    if (!items.length || paymentSelectionTrackedRef.current) {
      return;
    }

    paymentSelectionTrackedRef.current = true;
    trackStoreEvent({
      eventType: "payment_option_selected",
      paymentOption: paymentMode === "cod_deposit" ? "Cash on Delivery" : "Pay Now",
    }).catch(() => {});
  }, [items.length, paymentMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "mobile" || name === "pincode" ? value.replace(/\D+/g, "") : value,
    }));
    if (name === "pincode") {
      setLookupState({ loading: false, message: "" });
      if (value.replace(/\D+/g, "").length < 6) {
        setLastLookupPincode("");
      }
    }
  };

  const selectPaymentMode = (nextMode) => {
    setPaymentMode(nextMode);
    trackStoreEvent({
      eventType: "payment_option_selected",
      paymentOption: nextMode === "cod_deposit" ? "Cash on Delivery" : "Pay Now",
    }).catch(() => {});
  };

  const handlePayment = async () => {
    if (!items.length) {
      setErrorMessage("Your cart is empty.");
      return;
    }

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
        couponCode: effectiveCouponCode,
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
        navigate(
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

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        name: "AI4Kids",
        description:
          paymentMode === "cod_deposit"
            ? "COD confirmation payment"
            : "Full order payment",
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
          color: "#0d4fd8",
        },
        handler: async (response) => {
          await verifyPayment({
            orderId: order.orderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          clearCart();
          setCheckoutToken(generateCheckoutToken());
          navigate(
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
            navigate(
              `/payment-failure?orderNumber=${encodeURIComponent(order.orderNumber)}&reason=${encodeURIComponent("Customer closed Razorpay checkout.")}`
            );
          },
        },
      });

      razorpay.on("payment.failed", async (response) => {
        await markPaymentFailure({
          orderId: order.orderId,
          reason: response.error?.description || "Razorpay payment failed.",
        });
        setErrorMessage(response.error?.description || "Payment failed. Please try again.");
        setSubmitting(false);
        setCheckoutToken(generateCheckoutToken());
        navigate(
          `/payment-failure?orderNumber=${encodeURIComponent(order.orderNumber)}&reason=${encodeURIComponent(response.error?.description || "Payment failed.")}`
        );
      });

      razorpay.open();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Checkout failed.");
      setSubmitting(false);
      setCheckoutToken(generateCheckoutToken());
    }
  };

  if (!items.length) {
    return (
      <div className="empty-state">
        <h2>Nothing to checkout yet</h2>
        <p>Add products first so we can create your order.</p>
      </div>
    );
  }

  return (
    <div className="page-stack checkout-layout">
      <section className="section-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Checkout</span>
            <h1>Finish your order</h1>
            <p className="section-copy">
              Enter delivery details, review your total, and place the order securely.
            </p>
          </div>
        </div>

        <div className="checkout-grid">
          <div className="checkout-form-panel">
            <div className="form-grid">
              <label className="field-stack">
                <span>Name</span>
                <input className="text-input" name="name" placeholder="Enter customer name" value={form.name} onChange={handleChange} required />
              </label>
              <label className="field-stack">
                <span>Mobile</span>
                <input className="text-input" name="mobile" placeholder="10-digit mobile number" value={form.mobile} onChange={handleChange} required />
              </label>
              <label className="field-stack field-stack-wide">
                <span>Address</span>
                <textarea className="text-input textarea" name="address" placeholder="House, street, landmark" value={form.address} onChange={handleChange} required />
              </label>
              <label className="field-stack">
                <span>Pincode</span>
                <input className="text-input" name="pincode" placeholder="6-digit pincode" value={form.pincode} onChange={handleChange} required />
              </label>
              <label className="field-stack">
                <span>City</span>
                <input className="text-input" name="city" placeholder="City" value={form.city} onChange={handleChange} required />
              </label>
              <label className="field-stack">
                <span>State</span>
                <input className="text-input" name="state" placeholder="State" value={form.state} onChange={handleChange} required />
              </label>
            </div>
            {lookupState.loading || lookupState.message ? <p className="helper-text">{lookupState.message}</p> : null}
          </div>

          <aside className="summary-card sticky-card">
            <h2>Payment summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Coupon discount</span>
              <strong>-{formatCurrency(discount)}</strong>
            </div>
            {coupon && !couponAllowedForMode ? (
              <p className="helper-text">This coupon is not applicable for the selected payment mode.</p>
            ) : null}
            <div className="summary-row">
              <span>Order total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            {paymentMode === "cod_deposit" ? (
              <div className="summary-row">
                <span>COD Confirmation Fee</span>
                <strong>{formatCurrency(codConfirmationFee)}</strong>
              </div>
            ) : null}
            <div className="summary-row">
              <span>{paymentMode === "cod_deposit" ? "Pay Now to Confirm COD" : "Pay now"}</span>
              <strong>{formatCurrency(paymentAmount)}</strong>
            </div>
            {paymentMode === "cod_deposit" ? (
              <div className="summary-row total">
                <span>Balance on delivery</span>
                <strong>{formatCurrency(balanceDue)}</strong>
              </div>
            ) : null}
            {paymentMode === "cod_deposit" ? (
              <p className="helper-text">
                COD confirmation: Rs 40 per item in your cart (bundles included).
              </p>
            ) : null}
            <div className="checkout-line-items">
              {items.map((item) => (
                <div key={item.itemKey} className="summary-row compact">
                  <span>{item.name} x {item.quantity}</span>
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            {errorMessage ? <p className="helper-text error-text">{errorMessage}</p> : null}
            <div className="checkout-paymode-grid" aria-label="Select payment option">
              <button
                type="button"
                className={`checkout-paymode-card ${paymentMode === "cod_deposit" ? "active" : ""}`}
                onClick={() => selectPaymentMode("cod_deposit")}
              >
                <strong>Cash on Delivery</strong>
                <span>Rs 40 per item confirmation</span>
              </button>
              <button
                type="button"
                className={`checkout-paymode-card ${paymentMode === "full_payment" ? "active" : ""}`}
                onClick={() => selectPaymentMode("full_payment")}
              >
                <strong>Pay Now</strong>
                <span>Pay full amount securely</span>
              </button>
            </div>
            <button className="primary-button large" onClick={handlePayment} disabled={submitting}>
              {submitting
                ? "Opening checkout..."
                : paymentAmount <= 0
                  ? "Place Order"
                  : `Pay ${formatCurrency(paymentAmount)}`}
            </button>
          </aside>
        </div>
      </section>
      <section className="section-panel">
        <TrustMarkers />
      </section>

      <div className="mobile-pay-bar">
        <div className="paymode-segment" aria-label="Select payment option">
          <button
            type="button"
            className={`paymode-button ${paymentMode === "cod_deposit" ? "active" : ""}`}
            onClick={() => selectPaymentMode("cod_deposit")}
          >
            COD
            <span>Rs 40 per item</span>
          </button>
          <button
            type="button"
            className={`paymode-button ${paymentMode === "full_payment" ? "active" : ""}`}
            onClick={() => selectPaymentMode("full_payment")}
          >
            Pay Now
            <span>Secure</span>
          </button>
        </div>

        <div className="paybar-row">
          <div>
            <span>{paymentMode === "cod_deposit" ? "Pay now to confirm COD" : "Pay now"}</span>
            <strong>{formatCurrency(paymentAmount)}</strong>
            {paymentMode === "cod_deposit" ? (
              <small>Balance due on delivery: {formatCurrency(balanceDue)}</small>
            ) : null}
          </div>
          <button className="primary-button" onClick={handlePayment} disabled={submitting}>
            {submitting
              ? "Opening..."
              : paymentAmount <= 0
                ? "Place Order"
                : `Pay ${formatCurrency(paymentAmount)}`}
          </button>
        </div>
      </div>
    </div>
  );
};
