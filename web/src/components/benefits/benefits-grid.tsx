const benefitItems = [
  {
    title: "Top Sellers",
    subtitle: "Hot picks for kids",
    gradient: "from-[#fff2f8] to-[#f4e9ff]",
    tint: "from-[#ff9ca9] to-[#ffbf75]",
    icon: <BlasterIcon />,
  },
  {
    title: "Secure Payments",
    subtitle: "Fast and safe",
    gradient: "from-[#eef7ff] to-[#f2ecff]",
    tint: "from-[#59b7ff] to-[#8a7bff]",
    icon: <ShieldIcon />,
  },
  {
    title: "Exciting Offers",
    subtitle: "Great discounts",
    gradient: "from-[#fff3fb] to-[#fff0e5]",
    tint: "from-[#ff8fb6] to-[#ffc65c]",
    icon: <GiftIcon />,
  },
  {
    title: "Swift Delivery",
    subtitle: "Fast doorstep shipping",
    gradient: "from-[#f1fff4] to-[#eef7ff]",
    tint: "from-[#7fe57f] to-[#6cc9ff]",
    icon: <TruckIcon />,
  },
] as const;

export function BenefitsGrid() {
  return (
    <section className="rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,241,255,0.94))] p-3 shadow-[0_18px_40px_rgba(185,153,224,0.16)]">
      <div className="grid grid-cols-2 gap-2">
        {benefitItems.map((item) => (
          <article
            key={item.title}
            className={`rounded-[20px] border border-white/90 bg-gradient-to-br ${item.gradient} p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(183,157,225,0.14)]`}
          >
            <div
              className={`mb-2 flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br ${item.tint} text-white shadow-[0_10px_20px_rgba(140,112,201,0.18)]`}
            >
              {item.icon}
            </div>
            <h3 className="text-[13px] font-extrabold leading-4 text-[#46356f]">{item.title}</h3>
            <p className="mt-1 text-[11px] leading-4 text-[#7a6e99]">{item.subtitle}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function BlasterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M4 12.5l8.2-4.6 4.1 2.36 3.2-.9 1.5 2.58-2.62 1.53v2.23h-2.7v-1.13l-3.5 2.02H8.5v-2.22H4v-1.85zm4.7 1.05h1.5v1.2H8.7v-1.2z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M12 2l7 3v5.3c0 4.7-2.94 8.93-7 10.7-4.06-1.77-7-6-7-10.7V5l7-3zm0 4.2L7.8 8v2.32c0 3.13 1.77 6.05 4.2 7.39 2.43-1.34 4.2-4.26 4.2-7.39V8L12 6.2zm-1 8.65L8.5 12.4l1.27-1.27L11 12.37l3.2-3.2 1.3 1.3L11 14.85z" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M20 7h-2.18A2.99 2.99 0 0012 4.5 2.99 2.99 0 006.18 7H4a1 1 0 00-1 1v3h1v8a1 1 0 001 1h14a1 1 0 001-1v-8h1V8a1 1 0 00-1-1zm-6.5-1a1.5 1.5 0 011.5 1h-3a1.5 1.5 0 011.5-1zM10.5 6A1.5 1.5 0 0112 7H9a1.5 1.5 0 011.5-1zM5 9h6v2H5V9zm1 4h5v6H6v-6zm7 6v-6h5v6h-5zm5-8h-5V9h5v2z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M3 6h11v8h2.5L19 9h2l1 2v5h-1.2a2.8 2.8 0 11-5.6 0H9.8a2.8 2.8 0 11-5.6 0H3V6zm13 3.5V12H20v-1.1l-.68-1.4H16zM7 17.2a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zm11 0a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" />
    </svg>
  );
}
