import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder } from "../api/storeApi.js";
import { formatCurrency } from "../utils/currency.js";

export const CodOrderSuccessPage = () => {
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
        setErrorMessage(error.response?.data?.message || "We could not load the COD order details.");
      }
    };

    loadOrder();
  }, [orderNumber]);

  return (
    <div className="page-stack static-page payment-response-page">
      <section className="section-panel static-page-panel response-panel cod-panel">
        <span className="eyebrow">COD Order Received</span>
        <h1>Your order is confirmed for cash on delivery.</h1>
        <p>
          We have received your COD confirmation fee. Our team will now process the order and the
          remaining amount will be collected when the package is delivered.
        </p>
        <p>
          Order number: <strong>{orderNumber}</strong>
        </p>
        {order ? (
          <div className="success-card">
            <p>
              COD Confirmation Fee Paid: <strong>{formatCurrency(order.codConfirmationFee || order.paymentAmount)}</strong>
            </p>
            <p>
              Paid now: <strong>{formatCurrency(order.paymentAmount)}</strong>
            </p>
            <p>
              Remaining on delivery: <strong>{formatCurrency(order.balanceDue)}</strong>
            </p>
            <p>
              Payment status: <strong>{order.paymentStatus}</strong>
            </p>
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
        <a className="text-button" href="mailto:support@ai4kids.in">
          Need help with delivery or COD? Contact support
        </a>
      </section>
    </div>
  );
};
