const trustPoints = [
  { title: "Cash on Delivery", copy: "Available" },
  { title: "Secure", copy: "Payment" },
  { title: "Fast Dispatch", copy: "24x7 Support" },
  { title: "Parent", copy: "Picked Toys" },
];

const TrustGlyph = ({ index }) => {
  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2l7 4v6c0 5-3.3 8.8-7 10-3.7-1.2-7-5-7-10V6l7-4zm0 3.1L7 7.9v4.1c0 3.9 2.4 6.9 5 8 2.6-1.1 5-4.1 5-8V7.9l-5-2.8z" fill="currentColor" />
      </svg>
    );
  }

  if (index === 2) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 2L4 13h6l-1 9 9-11h-6l1-9z" fill="currentColor" />
      </svg>
    );
  }

  if (index === 3) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 7h-3.2a3 3 0 10-5.8-1 3 3 0 00-5.8 1H2v4h1v10h18V11h1V7zM9 5a1 1 0 110 2H7a1 1 0 010-2h2zm8 0a1 1 0 010 2h-2a1 1 0 010-2h2zM5 11h6v8H5v-8zm8 8v-8h6v8h-6z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 5h13l-1.55 5.41A2 2 0 0116.53 12H9.2l-.38 1.5h9.93v2H8a2 2 0 01-1.94-2.49L7.6 7H5V5h2zm1.5 12a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5zm8 0a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5z" fill="currentColor" />
    </svg>
  );
};

export const TrustStrip = () => (
  <section className="trust-inline-strip" aria-label="Shopping trust highlights">
    {trustPoints.map((point, index) => (
      <article key={point.title} className="trust-inline-card">
        <span className="trust-inline-icon">
          <TrustGlyph index={index} />
        </span>
        <div>
          <strong>{point.title}</strong>
          <span>{point.copy}</span>
        </div>
      </article>
    ))}
  </section>
);
