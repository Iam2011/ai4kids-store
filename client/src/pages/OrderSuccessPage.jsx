import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder } from "../api/storeApi.js";
import { formatCurrency } from "../utils/currency.js";

export const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await getOrder(orderNumber);
        setOrder(response.order);
        setErrorMessage("");
      } catch (error) {
        setOrder(null);
        setErrorMessage(error.response?.data?.message || "We could not load the full order summary.");
      }
    };

    loadOrder();
  }, [orderNumber]);

  return (
    <div className="empty-state success-state">
      <h1>Order confirmed</h1>
      <p>Your order number is {orderNumber}. We&apos;ve saved it and triggered the post-order workflow.</p>
      {order ? (
        <div className="success-card">
          <p>
            Payment status: <strong>{order.paymentStatus}</strong>
          </p>
          <p>
            Order status: <strong>{order.orderStatus}</strong>
          </p>
          <p>
            Paid now: <strong>{formatCurrency(order.paymentAmount)}</strong>
          </p>
          {order.balanceDue > 0 ? (
            <p>
              Balance due later: <strong>{formatCurrency(order.balanceDue)}</strong>
            </p>
          ) : null}
          {order.items?.length ? (
            <div className="success-order-items">
              {order.items.map((item) => (
                <p key={`${item.sku}-${item.slug}`}>
                  {item.name} x {item.quantity}
                  {item.itemType === "combo" && item.bundleItems?.length
                    ? ` (${item.bundleItems.map((bundleItem) => bundleItem.name).join(", ")})`
                    : ""}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : errorMessage ? (
        <p className="helper-text">{errorMessage}</p>
      ) : null}
      <div className="hero-cta-row">
        <Link className="primary-button" to="/products">
          Continue Shopping
        </Link>
        <Link className="secondary-button" to="/">
          Back to Home
        </Link>
      </div>
    </div>
  );
};
