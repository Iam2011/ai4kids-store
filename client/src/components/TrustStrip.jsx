const trustPoints = [
  {
    title: "COD Available",
    copy: "Transparent confirmation fee with the remaining balance paid on delivery.",
    icon: "cod",
  },
  {
    title: "Secure Payments",
    copy: "Razorpay-backed payment flow built to feel safe and simple on mobile.",
    icon: "checkout",
  },
  {
    title: "Fast Dispatch",
    copy: "Quick confirmation and dispatch updates for mobile-first toy orders.",
    icon: "bolt",
  },
  {
    title: "Support Available",
    copy: "Clear support and policy access before and after checkout.",
    icon: "spark",
  },
  {
    title: "Parent-Picked",
    copy: "Gift-ready picks chosen by age, use case, and checkout ease.",
    icon: "gift",
  },
];

const TrustIcon = ({ kind }) => {
  if (kind === "bolt") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 2L4 13h6l-1 9 9-11h-6l1-9z" />
      </svg>
    );
  }

  if (kind === "spark") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2l2.6 6.4L21 11l-6.4 2.6L12 20l-2.6-6.4L3 11l6.4-2.6L12 2z" />
      </svg>
    );
  }

  if (kind === "gift") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 7h-3.2a3 3 0 10-5.8-1 3 3 0 00-5.8 1H2v4h1v10h18V11h1V7zM9 5a1 1 0 110 2H7a1 1 0 010-2h2zm8 0a1 1 0 010 2h-2a1 1 0 010-2h2zM5 11h6v8H5v-8zm8 8v-8h6v8h-6z" />
      </svg>
    );
  }

  if (kind === "checkout") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6h18v12H3V6zm2 2v8h14V8H5zm2 2h4v2H7v-2z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l7 4v6c0 5-3.3 8.8-7 10-3.7-1.2-7-5-7-10V6l7-4zm0 3.1L7 7.9v4.1c0 3.9 2.4 6.9 5 8 2.6-1.1 5-4.1 5-8V7.9l-5-2.8z" />
    </svg>
  );
};

export const TrustStrip = () => (
  <section className="section-panel trust-strip-panel" aria-label="Shopping trust highlights">
    <div className="trust-strip">
      {trustPoints.map((point) => (
        <article key={point.title} className="trust-chip">
          <span className="trust-icon">
            <TrustIcon kind={point.icon} />
          </span>
          <div>
            <h3>{point.title}</h3>
            <p>{point.copy}</p>
          </div>
        </article>
      ))}
    </div>
  </section>
);
