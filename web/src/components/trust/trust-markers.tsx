const trustMarkers = [
  {
    title: "Fast Dispatch",
    copy: "Quick support and order updates for families across India.",
  },
  {
    title: "Trusted Checkout",
    copy: "Secure payment flow with COD and online payment support.",
  },
  {
    title: "Curated Picks",
    copy: "Popular toys, gifting ideas, and playtime best sellers in one place.",
  },
];

export function TrustMarkers() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {trustMarkers.map((item) => (
        <article
          key={item.title}
          className="rounded-[24px] bg-white/95 p-4 shadow-[0_18px_40px_rgba(148,123,191,0.12)]"
        >
          <strong className="text-sm text-[#40346f]">{item.title}</strong>
          <p className="mt-2 text-sm leading-6 text-[#6d6790]">{item.copy}</p>
        </article>
      ))}
    </div>
  );
}
