"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { cn } from "@/lib/utils/cn";

const drawerLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/checkout", label: "Checkout" },
  { href: "/about", label: "About Us" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/return-refund-policy", label: "Return & Refund" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdminRoute = pathname.startsWith("/admin");
  const isCheckoutRoute = pathname === "/checkout";

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
        <div className="relative mx-auto flex h-[66px] w-full max-w-[460px] items-center rounded-[28px] border border-white/80 bg-white/95 px-4 shadow-[0_18px_44px_rgba(192,160,232,0.28)] backdrop-blur sm:max-w-3xl lg:max-w-6xl">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faf6ff] text-[#5d5087] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
          >
            <span className="flex flex-col gap-1">
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>

          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image
              src="/logo.png"
              alt="AI4Kids"
              width={128}
              height={40}
              priority
              className="h-auto w-[122px] sm:w-[136px]"
            />
          </Link>

          <div className="ml-auto flex items-center rounded-full border border-[#ede5fb] bg-[#fcf9ff] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            {!isCheckoutRoute ? (
              <button
                type="button"
                onClick={() => router.push("/products")}
                aria-label="Search products"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#5a4f84]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M10.5 4a6.5 6.5 0 014.83 10.84l4.41 4.41-1.42 1.42-4.41-4.41A6.5 6.5 0 1110.5 4zm0 2a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                </svg>
              </button>
            ) : null}

            {!isCheckoutRoute ? <span className="h-6 w-px bg-[#eee6fb]" /> : null}

            <Link
              href="/cart"
              aria-label="Open cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#5a4f84]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M7 5h13l-1.55 5.41A2 2 0 0116.53 12H9.2l-.38 1.5h9.93v2H8a2 2 0 01-1.94-2.49L7.6 7H5V5h2zm1.5 12a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5zm8 0a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5z" />
              </svg>
              {itemCount ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ff6f95] px-1 text-[10px] font-bold text-white shadow-[0_8px_16px_rgba(255,111,149,0.32)]">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 bg-[#251b48]/30 backdrop-blur-sm"
        />
        <aside
          className={cn(
            "absolute left-4 top-4 flex w-[calc(100%-2rem)] max-w-[340px] flex-col rounded-[32px] bg-white p-5 shadow-[0_30px_80px_rgba(50,34,93,0.28)] transition-transform",
            menuOpen ? "translate-x-0" : "-translate-x-[110%]"
          )}
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a89b6]">
                Quick Menu
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#40346f]">Browse AI4Kids</h2>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="rounded-full bg-[#f5efff] px-3 py-2 text-sm font-semibold text-[#6b5e9c]"
            >
              Close
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            {drawerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-[#4f427f] transition-colors hover:bg-[#faf5ff]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 rounded-[24px] bg-gradient-to-br from-[#fff6d9] to-[#eef9ff] p-4">
            <strong className="text-sm text-[#40346f]">Need help with an order?</strong>
            <p className="mt-2 text-sm leading-6 text-[#6d6790]">
              Support for combo orders, delivery updates, and payment help.
            </p>
            <a
              href="mailto:support@ai4kids.in"
              className="mt-3 inline-block text-sm font-semibold text-[#6f5df6]"
            >
              support@ai4kids.in
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
