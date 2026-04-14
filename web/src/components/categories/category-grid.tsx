"use client";

import Image from "next/image";
import Link from "next/link";
import { homepageCategories } from "@/lib/constants/categories";
import { trackStoreEvent } from "@/lib/analytics/track";
import { SectionHeader } from "@/components/shared/section-header";

export function CategoryGrid() {
  return (
    <section className="rounded-[30px] bg-white/90 p-5 shadow-[0_24px_60px_rgba(153,132,196,0.14)]">
      <SectionHeader title="Shop by Category" actionHref="/products" />
      <div className="grid grid-cols-4 gap-3">
        {homepageCategories.map((category) => (
          <Link
            key={category.label}
            href={category.href}
            className="flex min-h-[128px] flex-col items-center justify-between rounded-[22px] border border-[#efe8fb] bg-white px-3 py-4 text-center shadow-[0_12px_26px_rgba(143,116,180,0.08)]"
            onClick={() => {
              void trackStoreEvent({
                eventType: "category_click",
                category: {
                  categoryLabel: category.routeLabel,
                },
              }).catch(() => {});
            }}
          >
            <div className="relative flex h-14 w-full items-center justify-center">
              <Image
                src={category.icon}
                alt=""
                width={52}
                height={52}
                className="h-auto max-h-14 w-auto object-contain"
              />
            </div>
            <span className="text-[13px] font-semibold leading-4 text-[#433870]">
              {category.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
