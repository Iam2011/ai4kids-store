import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder } from "../api/storeApi.js";
import { formatCurrency } from "../utils/currency.js";
import { trackOrderPlacedOnce } from "../utils/visitTracking.js";

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
        trackOrderPlacedOnce({
          orderNumber,
          orderValue: response.order.totalAmount,
          paymentOption: response.order.paymentMode,
        });
      } catch (error) {
        setOrder(null);
        setErrorMessage(error.response?.data?.message || "We could not load the full order summary.");
      }
    };

    loadOrder();
  }, [orderNumber]);

  return (
    <div className="page-stack static-page payment-response-page">
      <section className="section-panel static-page-panel response-panel success-panel">
        <span className="eyebrow">Payment Success</span>
        <h1>Payment received and order confirmed.</h1>
        <p>
          Your payment has been captured successfully. We&apos;ve saved the order and the team can now
          process it for dispatch.
        </p>
        <p>
          Order number: <strong>{orderNumber}</strong>
        </p>
        {order ? (
          <div className="success-card">
            <p>
              Payment status: <strong>{order.paymentStatus}</strong>
            </p>
            <p>
              Order status: <strong>{order.orderStatus}</strong>
            </p>
            <p>
              Amount paid: <strong>{formatCurrency(order.paymentAmount)}</strong>
            </p>
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
          <Link className="secondary-button" to="/about">
            Need Help?
          </Link>
        </div>
        <a className="text-button" href="mailto:support@ai4kids.in">
          Email support for order help
        </a>
      </section>
    </div>
  );
};
