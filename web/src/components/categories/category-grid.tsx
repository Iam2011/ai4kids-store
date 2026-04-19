"use client";

import Image from "next/image";
import Link from "next/link";
import { homepageCategories } from "@/lib/constants/categories";
import { trackStoreEvent } from "@/lib/analytics/track";

const viewAllHref = "/products";

export function CategoryGrid() {
  return (
    <section className="rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,239,255,0.96))] p-4 shadow-[0_20px_48px_rgba(185,153,224,0.16)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[1.7rem] font-black tracking-tight text-[#4a3a79]">Shop by Category</h2>
        <Link
          href={viewAllHref}
          aria-label="View all categories"
          className="inline-flex min-h-10 items-center rounded-full border border-[#eadcf6] bg-[linear-gradient(180deg,#fff9fd_0%,#f8f1ff_100%)] px-4 text-[13px] font-semibold text-[#6e53cd] shadow-[0_10px_24px_rgba(151,122,208,0.12)]"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {homepageCategories.map((category) => (
          <Link
            key={category.label}
            href={category.href}
            className="group rounded-[22px] border border-white/90 bg-white/70 p-2.5 text-center shadow-[0_12px_28px_rgba(171,143,220,0.12)] transition-transform duration-200 active:scale-[0.98]"
            onClick={() => {
              void trackStoreEvent({
                eventType: "category_click",
                category: {
                  categoryLabel: category.routeLabel,
                },
              }).catch(() => {});
            }}
          >
            <div
              className={[
                "relative overflow-hidden rounded-[18px] border border-white/80 bg-gradient-to-b shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]",
                category.toneClassName,
              ].join(" ")}
            >
              <div className="pointer-events-none absolute inset-x-3 bottom-2 h-3 rounded-full bg-[radial-gradient(circle,rgba(87,68,126,0.16),transparent_72%)] blur-[6px]" />
              <div className="relative mx-auto h-[62px] w-full max-w-[58px]">
                <Image
                  src={category.icon}
                  alt={category.label}
                  fill
                  sizes="58px"
                  className={[
                    "object-contain drop-shadow-[0_12px_16px_rgba(72,57,111,0.12)] transition-transform duration-300 group-hover:scale-[1.03]",
                    category.imageClassName,
                  ].join(" ")}
                />
              </div>
            </div>
            <p className="mt-2 text-[11px] font-bold leading-4 text-[#5a4d86]">{category.label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
