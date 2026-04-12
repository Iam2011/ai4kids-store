import { Link, useSearchParams } from "react-router-dom";

export const PaymentFailurePage = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "";
  const reason = searchParams.get("reason") || "The payment could not be completed.";

  return (
    <div className="page-stack static-page payment-response-page">
      <section className="section-panel static-page-panel response-panel failure-panel">
        <span className="eyebrow">Payment Failed</span>
        <h1>Your payment did not go through.</h1>
        <p>
          No worries. You can retry checkout safely and continue from your current cart. If the
          amount was debited and not confirmed, wait for your bank update and contact support if needed.
        </p>
        {orderNumber ? (
          <p>
            Order reference: <strong>{orderNumber}</strong>
          </p>
        ) : null}
        <p className="helper-text error-text">{reason}</p>
        <div className="hero-cta-row">
          <Link className="primary-button" to="/checkout">
            Retry Payment
          </Link>
          <Link className="secondary-button" to="/cart">
            Return to Cart
          </Link>
        </div>
        <a className="text-button" href="mailto:support@ai4kids.in">
          Need help? Contact support
        </a>
      </section>
    </div>
  );
};
