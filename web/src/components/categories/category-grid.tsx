"use client";

import Image from "next/image";
import Link from "next/link";
import { homepageCategories } from "@/lib/constants/categories";
import { trackStoreEvent } from "@/lib/analytics/track";

const viewAllHref = "/products";

export function CategoryGrid() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/84 shadow-[0_20px_48px_rgba(193,165,231,0.24)]">
      <Image
        src="/assets/ui/home/category-section-reference-crop.png"
        alt="Shop by Category"
        width={1280}
        height={760}
        sizes="(max-width: 768px) 100vw, 720px"
        className="h-auto w-full"
      />

      <Link
        href={viewAllHref}
        aria-label="View all categories"
        className="absolute right-[4.8%] top-[4.3%] h-[12%] w-[19%] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f6dff]"
      />

      <div className="absolute inset-x-[6.3%] bottom-[8.2%] top-[18.2%] grid grid-cols-4 gap-x-[2.4%] gap-y-[4.2%]">
        {homepageCategories.map((category) => (
          <Link
            key={category.label}
            href={category.href}
            aria-label={category.label}
            className="rounded-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f6dff]"
            onClick={() => {
              void trackStoreEvent({
                eventType: "category_click",
                category: {
                  categoryLabel: category.routeLabel,
                },
              }).catch(() => {});
            }}
          />
        ))}
      </div>
    </section>
  );
}
