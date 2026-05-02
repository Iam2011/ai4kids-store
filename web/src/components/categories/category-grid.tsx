"use client";

import Image from "next/image";
import Link from "next/link";
import { homepageCategories } from "@/lib/constants/categories";
import { trackStoreEvent } from "@/lib/analytics/track";

const viewAllHref = "/products";

export function CategoryGrid() {
  return (
    <section className="rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,239,255,0.96))] p-3.5 shadow-[0_20px_48px_rgba(185,153,224,0.16)] sm:p-4 md:p-5">
      <div className="mb-3.5 flex items-center justify-between gap-2.5 sm:mb-4 sm:gap-3">
        <h2 className="text-[1.52rem] font-black tracking-tight text-[#4a3a79] sm:text-[1.62rem] md:text-[1.72rem]">
          Shop by Category
        </h2>
        <Link
          href={viewAllHref}
          aria-label="View all categories"
          className="inline-flex min-h-9 items-center rounded-full border border-[#eadcf6] bg-[linear-gradient(180deg,#fff9fd_0%,#f8f1ff_100%)] px-3 text-[12px] font-semibold text-[#6e53cd] shadow-[0_10px_24px_rgba(151,122,208,0.12)] sm:min-h-10 sm:px-4 sm:text-[13px]"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-2.5 md:gap-3">
        {homepageCategories.map((category) => (
          <Link
            key={category.label}
            href={category.href}
            className="group rounded-[20px] border border-white/90 bg-white/75 p-2 text-center shadow-[0_12px_28px_rgba(171,143,220,0.12)] transition-transform duration-200 active:scale-[0.98] sm:rounded-[22px] sm:p-2.5 md:rounded-[24px] md:p-3"
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
                "relative overflow-hidden rounded-[16px] border border-white/80 bg-gradient-to-b shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] sm:rounded-[18px] md:rounded-[20px]",
                category.toneClassName,
              ].join(" ")}
            >
              <div className="pointer-events-none absolute inset-x-2.5 bottom-1.5 h-3 rounded-full bg-[radial-gradient(circle,rgba(87,68,126,0.16),transparent_72%)] blur-[6px] sm:inset-x-3 sm:bottom-2" />
              <div className="relative mx-auto h-[56px] w-full max-w-[52px] sm:h-[62px] sm:max-w-[58px] md:h-[74px] md:max-w-[68px]">
                <Image
                  src={category.icon}
                  alt={category.label}
                  fill
                  sizes="(max-width: 430px) 52px, (max-width: 768px) 58px, 68px"
                  className={[
                    "object-contain drop-shadow-[0_12px_16px_rgba(72,57,111,0.12)] transition-transform duration-300 group-hover:scale-[1.03]",
                    category.imageClassName,
                  ].join(" ")}
                />
              </div>
            </div>
            <p className="mt-1.5 min-h-[1.95rem] text-[10px] font-bold leading-4 text-[#5a4d86] sm:mt-2 sm:text-[11px] md:min-h-[2.1rem] md:text-[12px]">
              {category.label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
