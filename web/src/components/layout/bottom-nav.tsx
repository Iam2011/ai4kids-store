"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { bottomNavItems } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

function NavGlyph({ label }: { label: string }) {
  if (label === "Categories") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
      </svg>
    );
  }

  if (label === "Deals") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M5 5.5A2.5 2.5 0 017.5 3h4.086a2.5 2.5 0 011.768.732l5.914 5.914a2.5 2.5 0 010 3.536l-5.086 5.086a2.5 2.5 0 01-3.536 0L4.732 12.354A2.5 2.5 0 014 10.586V5.5h1zm3.25 1.25a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />
      </svg>
    );
  }

  if (label === "Cart") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M7 5h13l-1.55 5.41A2 2 0 0116.53 12H9.2l-.38 1.5h9.93v2H8a2 2 0 01-1.94-2.49L7.6 7H5V5h2zm1.5 12a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5zm8 0a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M12 3.5l8 6V20h-5.5v-5.5h-5V20H4V9.5l8-6z" />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showBottomNav =
    pathname === "/" ||
    pathname === "/products" ||
    pathname.startsWith("/products/") ||
    pathname === "/cart";

  if (!showBottomNav) return null;

  return (
    <nav className="fixed inset-x-0 bottom-3 z-40 px-4 pb-[max(env(safe-area-inset-bottom),0px)] sm:px-6">
      <div className="mx-auto flex max-w-[380px] items-center justify-between rounded-[28px] bg-white/95 px-3 py-2 shadow-[0_26px_60px_rgba(60,40,110,0.22)] backdrop-blur">
        {bottomNavItems.map((item) => {
          const featuredView = searchParams.get("featured") === "true";
          const active =
            item.label === "Home"
              ? pathname === "/"
              : item.label === "Deals"
                ? pathname === "/products" && featuredView
                : item.label === "Categories"
                  ? (pathname === "/products" && !featuredView) || pathname.startsWith("/products/")
                  : pathname === item.match || pathname.startsWith(item.match);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex min-w-[68px] flex-1 flex-col items-center justify-center gap-1 rounded-[20px] px-2 py-2 text-[11px] font-semibold text-[#7c749c] transition-colors",
                active
                  ? "bg-gradient-to-r from-[#ff8a63] via-[#ff6f96] to-[#8f6dff] text-white shadow-[0_12px_26px_rgba(143,109,255,0.28)]"
                  : "hover:bg-[#f7f3ff]"
              )}
            >
              <NavGlyph label={item.label} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
