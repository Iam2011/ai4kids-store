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
            aria-label={category.label}
            className="flex min-h-[112px] items-center justify-center rounded-[16px] border border-[#efe8fb] bg-white p-3 text-center shadow-[0_12px_26px_rgba(143,116,180,0.08)]"
            onClick={() => {
              void trackStoreEvent({
                eventType: "category_click",
                category: {
                  categoryLabel: category.routeLabel,
                },
              }).catch(() => {});
            }}
          >
            <div className="relative flex h-full w-full items-center justify-center">
              <Image
                src={category.icon}
                alt={category.label}
                width={96}
                height={128}
                className="h-auto max-h-[92px] w-full max-w-[88px] object-contain"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
