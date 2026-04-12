import { Link, useNavigate } from "react-router-dom";
import { validateCoupon } from "../api/storeApi.js";
import { QuantitySelector } from "../components/QuantitySelector.jsx";
import { TrustMarkers } from "../components/TrustMarkers.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/currency.js";
import { useState } from "react";
import { calculateCodConfirmationFee } from "../utils/pricing.js";

export const CartPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, coupon, applyCoupon, clearCoupon, updateQuantity, removeItem } = useCart();
  const [couponCode, setCouponCode] = useState(coupon?.code || "");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const previewDiscount = coupon?.discountAmount || 0;
  const previewTotal = Math.max(0, subtotal - previewDiscount);
  const codConfirmationFee = calculateCodConfirmationFee(items);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage("Enter a coupon code first.");
      return;
    }

    setCouponLoading(true);
    setCouponMessage("");

    try {
      const data = await validateCoupon({
        couponCode,
        subtotal,
        paymentMode: "full_payment",
      });
      applyCoupon(data);
      setCouponMessage(`${data.code} applied successfully.`);
    } catch (error) {
      clearCoupon();
      setCouponMessage(error.response?.data?.message || "Unable to apply coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="empty-state">
        <h2>Your cart is empty</h2>
        <p>Add a few toys and come back here to unlock checkout.</p>
        <Link className="primary-button" to="/products">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page-stack cart-layout">
      <section className="section-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Cart</span>
            <h1>Review your toys before checkout</h1>
            <p className="section-copy">
              Check quantities, review pricing, and see the COD confirmation fee clearly before you pay.
            </p>
          </div>
        </div>

        <div className="cart-grid">
          <div className="cart-items-panel">
            {items.map((item) => (
              <article key={item.itemKey} className="cart-item">
                <img src={item.imageUrl} alt={item.name} />
                <div className="cart-item-copy">
                  <span className="mini-label">{item.itemType === "combo" ? "Combo Offer" : "In Cart"}</span>
                  <h3>{item.name}</h3>
                  <p>
                    {item.category} | Age {item.ageGroup}
                  </p>
                  <p>
                    MOQ {item.moq}
                    {item.itemType === "combo" ? ` | Includes ${item.bundleItems?.length || 0} toys` : ""}
                  </p>
                  {item.itemType === "combo" && item.bundleItems?.length ? (
                    <p>{item.bundleItems.map((bundleItem) => bundleItem.name).join(" + ")}</p>
                  ) : null}
                  <div className="cart-item-footer">
                    <QuantitySelector
                      quantity={item.quantity}
                      min={item.moq}
                      onChange={(value) => updateQuantity(item.itemKey, value)}
                    />
                    <button className="text-button" onClick={() => removeItem(item.itemKey)}>
                      Remove
                    </button>
                  </div>
                </div>
                <div className="cart-item-pricing">
                  {item.originalPrice > item.price ? (
                    <span>{formatCurrency(item.originalPrice * item.quantity)}</span>
                  ) : null}
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
              </article>
            ))}
          </div>

          <aside className="summary-card">
            <h2>Order summary</h2>
            <div className="coupon-box">
              <input
                className="text-input"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              />
              <button className="secondary-button" onClick={handleApplyCoupon} disabled={couponLoading}>
                {couponLoading ? "Applying..." : "Apply"}
              </button>
            </div>
            {couponMessage ? <p className="helper-text">{couponMessage}</p> : null}

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Coupon discount</span>
              <strong>-{formatCurrency(previewDiscount)}</strong>
            </div>
            <div className="summary-row">
              <span>COD Confirmation Fee</span>
              <strong>{formatCurrency(codConfirmationFee)}</strong>
            </div>
            <p className="helper-text">
              If you choose COD, you will pay {formatCurrency(Math.min(previewTotal, codConfirmationFee))} now to confirm the order.
            </p>
            <div className="summary-row total">
              <span>Total</span>
              <strong>{formatCurrency(previewTotal)}</strong>
            </div>

            <button className="primary-button large" onClick={() => navigate("/checkout")}>
              Proceed to Checkout
            </button>
          </aside>
        </div>
      </section>
      <section className="section-panel">
        <TrustMarkers />
      </section>

      <div className="mobile-checkout-bar">
        <div>
          <span>Total</span>
          <strong>{formatCurrency(previewTotal)}</strong>
          <small>COD fee shown before payment</small>
        </div>
        <button className="primary-button" onClick={() => navigate("/checkout")}>
          Checkout
        </button>
      </div>
    </div>
  );
};
