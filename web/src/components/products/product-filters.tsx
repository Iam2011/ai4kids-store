"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { storefrontCategories } from "@/lib/constants/categories";
import { listingCopy } from "@/lib/constants/copy";
import { Button } from "@/components/shared/button";
import { trackStoreEvent } from "@/lib/analytics/track";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "discount", label: "Best Deals" },
  { value: "priceAsc", label: "Price Low to High" },
  { value: "priceDesc", label: "Price High to Low" },
  { value: "latest", label: "New Arrivals" },
];

export function ProductFilters({
  onSearchSubmit,
}: {
  onSearchSubmit?: (term: string) => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const selectedCategory = searchParams.get("category") || "";
  const selectedSort = searchParams.get("sort") || "featured";
  const selectedFeatured = searchParams.get("featured") || "";
  const currentParams = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  const updateFilters = (updates: Record<string, string>) => {
    startTransition(() => {
      const next = new URLSearchParams(currentParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      router.replace(`/products?${next.toString()}`, { scroll: false });
    });
  };

  return (
    <section className="rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,240,255,0.95))] p-4 shadow-[0_20px_48px_rgba(153,132,196,0.14)] sm:rounded-[30px] sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a89b6]">{listingCopy.eyebrow}</p>
      <h1 className="mt-1 text-[1.7rem] font-black tracking-tight text-[#40346f] sm:text-3xl">{listingCopy.title}</h1>
      <p className="mt-2 text-[13px] leading-6 text-[#6d6790] sm:text-sm">
        {listingCopy.body}
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <input
          className="h-12 rounded-full border border-[#eadff7] bg-white px-4 text-sm text-[#433870] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] outline-none placeholder:text-[#9f96bd]"
          placeholder="Search toys"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              updateFilters({ search: searchInput });
              onSearchSubmit?.(searchInput);
            }
          }}
        />

        <div className="grid grid-cols-[108px_1fr] gap-2.5 sm:grid-cols-[120px_1fr] sm:gap-3">
          <Button
            className="min-h-12 text-sm font-bold"
            onClick={() => {
              updateFilters({ search: searchInput });
              onSearchSubmit?.(searchInput);
            }}
          >
            Search
          </Button>
          <select
            className="h-12 rounded-full border border-[#eadff7] bg-white px-4 text-sm font-semibold text-[#4e4478] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] outline-none"
            value={selectedSort}
            onChange={(event) => updateFilters({ sort: event.target.value })}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold sm:text-sm ${selectedFeatured === "true" ? "border-[#d9c9ff] bg-[#f4efff] text-[#6d5df6]" : "border-[#efe6fb] bg-[#fbf8ff] text-[#675d88]"}`}
          onClick={() => updateFilters({ featured: selectedFeatured === "true" ? "" : "true" })}
        >
          Best Sellers
        </button>
        {storefrontCategories.map((category) => (
          <button
            key={category}
            type="button"
            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold sm:text-sm ${selectedCategory === category ? "border-[#f6c7d8] bg-[#fff0f5] text-[#df628a]" : "border-[#efe6fb] bg-[#fbf8ff] text-[#675d88]"}`}
            onClick={() => {
              const nextCategory = selectedCategory === category ? "" : category;
              updateFilters({ category: nextCategory });
              if (nextCategory) {
                void trackStoreEvent({
                  eventType: "category_click",
                  category: { categoryLabel: nextCategory },
                }).catch(() => {});
              }
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {isPending ? <p className="mt-3 text-sm text-[#8b7fa8]">{listingCopy.refreshing}</p> : null}
    </section>
  );
}
