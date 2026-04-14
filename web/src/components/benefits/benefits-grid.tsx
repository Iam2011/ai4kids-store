const trustPoints = [
  { title: "Cash on Delivery", copy: "Available" },
  { title: "Secure Payment", copy: "Trusted checkout" },
  { title: "Fast Dispatch", copy: "Quick support" },
  { title: "Parent-Picked Toys", copy: "Curated picks" },
];

function TrustGlyph({ index }: { index: number }) {
  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M12 2l7 4v6c0 5-3.3 8.8-7 10-3.7-1.2-7-5-7-10V6l7-4zm0 3.1L7 7.9v4.1c0 3.9 2.4 6.9 5 8 2.6-1.1 5-4.1 5-8V7.9l-5-2.8z" />
      </svg>
    );
  }

  if (index === 2) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M13 2L4 13h6l-1 9 9-11h-6l1-9z" />
      </svg>
    );
  }

  if (index === 3) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M20 7h-3.2a3 3 0 10-5.8-1 3 3 0 00-5.8 1H2v4h1v10h18V11h1V7zM5 11h6v8H5v-8zm8 0h6v8h-6v-8z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M7 5h13l-1.55 5.41A2 2 0 0116.53 12H9.2l-.38 1.5h9.93v2H8a2 2 0 01-1.94-2.49L7.6 7H5V5h2z" />
    </svg>
  );
}

export function BenefitsGrid() {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {trustPoints.map((point, index) => (
        <article
          key={point.title}
          className="rounded-[22px] bg-white/95 p-4 shadow-[0_16px_36px_rgba(155,136,194,0.12)]"
        >
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f8efff] text-[#7a60ea]">
            <TrustGlyph index={index} />
          </span>
          <strong className="block text-sm leading-5 text-[#433870]">{point.title}</strong>
          <span className="mt-1 block text-xs text-[#81799f]">{point.copy}</span>
        </article>
      ))}
    </section>
  );
}
