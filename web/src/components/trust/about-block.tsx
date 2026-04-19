import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  { label: "Shop All Toys", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Return & Refund", href: "/return-refund-policy" },
] as const;

const supportPoints = [
  "Free shipping support on selected orders",
  "Secure payments with safe checkout",
  "Easy returns and responsive customer help",
] as const;

export function AboutBlock() {
  return (
    <footer className="rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,241,255,0.95))] p-4 shadow-[0_22px_50px_rgba(185,153,224,0.16)]">
      <div className="rounded-[24px] border border-[#eee4fa] bg-[linear-gradient(180deg,#ffffff_0%,#faf4ff_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
        <div className="flex items-start gap-3">
          <div className="rounded-[18px] bg-white px-3 py-2 shadow-[0_12px_24px_rgba(171,143,220,0.14)]">
            <Image src="/logo.png" alt="AI4Kids" width={128} height={40} className="h-auto w-[104px]" />
          </div>
          <div className="flex-1">
            <h2 className="text-[1.25rem] font-black leading-6 text-[#43356f]">AI4Kids Store Support</h2>
            <p className="mt-1 text-[13px] leading-5 text-[#746b93]">
              Smart toys, quick help, and trusted family shopping in one joyful place.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          {supportPoints.map((point, index) => (
            <div
              key={point}
              className={[
                "rounded-full px-3 py-2 text-[12px] font-semibold leading-4",
                index === 0
                  ? "bg-[#eef7ff] text-[#4860a8]"
                  : index === 1
                    ? "bg-[#fff2f8] text-[#a0537a]"
                    : "bg-[#f4f0ff] text-[#65508c]",
              ].join(" ")}
            >
              {point}
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[18px] border border-white/90 bg-[linear-gradient(180deg,#fffafd_0%,#f8f1ff_100%)] px-3 py-3 text-[12px] font-bold text-[#5a4b86] shadow-[0_10px_24px_rgba(171,143,220,0.1)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mt-5 rounded-[20px] bg-[linear-gradient(180deg,#fff5f9_0%,#f5f0ff_100%)] p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#9c8bb7]">Contact</p>
          <a href="mailto:support@ai4kids.in" className="mt-2 block text-[14px] font-extrabold text-[#5f48b3]">
            support@ai4kids.in
          </a>
          <p className="mt-1 text-[12px] leading-5 text-[#776e96]">
            Support for orders, delivery updates, returns, and payment help.
          </p>
        </div>

        <div className="mt-4 border-t border-[#eee4fa] pt-3 text-center text-[11px] font-medium text-[#8d83aa]">
          © 2026 AI4Kids. Smart fun for children.
        </div>
      </div>
    </footer>
  );
}
