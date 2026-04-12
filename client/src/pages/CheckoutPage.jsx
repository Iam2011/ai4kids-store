import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createPaymentOrder,
  lookupPincode,
  markPaymentFailure,
  verifyPayment,
} from "../api/storeApi.js";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/currency.js";
import { loadRazorpayScript } from "../utils/payment.js";

const COD_CONFIRMATION_AMOUNT = Number(import.meta.env.VITE_COD_CONFIRMATION_AMOUNT || 40);

const initialForm = {
  name: "",
  mobile: "",
  address: "",
  pincode: "",
  city: "",
  state: "",
};

const generateCheckoutToken = () =>
  globalThis.crypto?.randomUUID?.() || `checkout_${Date.now()}_${Math.random().toString(16).slice(2)}`;

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

  const couponAllowedForMode = coupon
    ? paymentMode === "cod_deposit"
      ? coupon.allowOnCod !== false
      : coupon.allowOnFull !== false
    : false;
  const effectiveCouponCode = couponAllowedForMode ? coupon?.code || "" : "";
  const discount = couponAllowedForMode ? coupon?.discountAmount || 0 : 0;
  const total = Math.max(0, subtotal - discount);
  const paymentAmount =
    paymentMode === "cod_deposit" ? Math.min(total, COD_CONFIRMATION_AMOUNT) : total;
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
        navigate(`/order-success/${order.orderNumber}`);
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
          navigate(`/order-success/${order.orderNumber}`);
        },
        modal: {
          ondismiss: async () => {
            await markPaymentFailure({
              orderId: order.orderId,
              reason: "Customer closed Razorpay checkout.",
            });
            setSubmitting(false);
            setCheckoutToken(generateCheckoutToken());
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
            <h1>Finish your order with a mobile-first form</h1>
          </div>
        </div>

        <div className="checkout-grid">
          <div className="checkout-form-panel">
            <div className="form-grid">
              <input className="text-input" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
              <input className="text-input" name="mobile" placeholder="Mobile" value={form.mobile} onChange={handleChange} required />
              <textarea className="text-input textarea" name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
              <input className="text-input" name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} required />
              <input className="text-input" name="city" placeholder="City" value={form.city} onChange={handleChange} required />
              <input className="text-input" name="state" placeholder="State" value={form.state} onChange={handleChange} required />
            </div>
            {lookupState.loading || lookupState.message ? <p className="helper-text">{lookupState.message}</p> : null}

            <div className="payment-choice-grid">
              <button
                type="button"
                className={`payment-choice ${paymentMode === "full_payment" ? "active" : ""}`}
                onClick={() => setPaymentMode("full_payment")}
              >
                <strong>Full Payment</strong>
                <span>Pay the complete amount via Razorpay and confirm instantly.</span>
              </button>
              <button
                type="button"
                className={`payment-choice ${paymentMode === "cod_deposit" ? "active" : ""}`}
                onClick={() => setPaymentMode("cod_deposit")}
              >
                <strong>Cash on Delivery</strong>
                <span>Pay Rs 40 now for order confirmation and the rest on delivery.</span>
              </button>
            </div>
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
            <div className="summary-row">
              <span>Pay now</span>
              <strong>{formatCurrency(paymentAmount)}</strong>
            </div>
            {paymentMode === "cod_deposit" ? (
              <div className="summary-row total">
                <span>Balance on delivery</span>
                <strong>{formatCurrency(balanceDue)}</strong>
              </div>
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
    </div>
  );
};
