import Image from "next/image";
import { PageContainer } from "@/components/shared/page-container";

const valuePillars = [
  {
    title: "Creative Learning Toys",
    text: "Curated picks that spark curiosity, imagination, and hands-on play at home.",
  },
  {
    title: "Screen-Free Smart Play",
    text: "Activity-led toys that help children stay engaged beyond passive screen time.",
  },
  {
    title: "Curated for Families",
    text: "Fast-moving toys, gifting options, and combo picks chosen for easy mobile shopping.",
  },
];

const supportPoints = [
  {
    label: "Call us",
    value: "8469023717",
    href: "tel:8469023717",
  },
  {
    label: "Email support",
    value: "info@ai4kids.in",
    href: "mailto:info@ai4kids.in",
  },
  {
    label: "Visit website",
    value: "www.ai4kids.in",
    href: "https://www.ai4kids.in",
  },
];

export default function AboutPage() {
  return (
    <PageContainer>
      <section className="rounded-[30px] bg-white/95 p-6 shadow-[0_24px_60px_rgba(153,132,196,0.15)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a89b6]">About AI4Kids</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_220px]">
          <div>
            <span className="text-sm font-semibold text-[#5a7f4d]">Smart Fun For Children</span>
            <h1 className="mt-2 text-3xl font-black leading-tight text-[#40346f]">
              Learning-led toys and playful gifting, curated for modern family shopping.
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#6d6790]">
              AI4Kids is built around one simple idea: make toy buying feel joyful, clear, and trustworthy on mobile. We curate exciting toys that help kids play, learn, and explore without making parents scroll through marketplace clutter.
            </p>
          </div>
          <div className="relative flex items-center justify-center rounded-[28px] bg-gradient-to-br from-[#f7ffd8] via-white to-[#fff8e8] p-5">
            <Image src="/logo.png" alt="AI4Kids" width={180} height={72} className="h-auto w-[160px]" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {valuePillars.map((item) => (
          <article
            key={item.title}
            className="rounded-[24px] bg-white/95 p-5 shadow-[0_18px_44px_rgba(148,123,191,0.12)]"
          >
            <h2 className="text-lg font-black text-[#40346f]">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#6d6790]">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[30px] bg-gradient-to-r from-[#f8ffd9] via-[#f7ffef] to-[#fff8ef] p-6 shadow-[0_24px_60px_rgba(171,196,110,0.2)]">
        <h2 className="text-2xl font-black text-[#2b5a38]">Contact & support</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {supportPoints.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-[22px] bg-white/85 p-4 shadow-[0_16px_36px_rgba(145,175,96,0.12)]"
            >
              <span className="block text-xs uppercase tracking-[0.14em] text-[#78a161]">{item.label}</span>
              <strong className="mt-2 block text-base text-[#31593e]">{item.value}</strong>
            </a>
          ))}
        </div>
        <p className="mt-5 text-base font-semibold text-[#3f6d4c]">
          Make Your Kids Learn While They Play
        </p>
      </section>
    </PageContainer>
  );
}
