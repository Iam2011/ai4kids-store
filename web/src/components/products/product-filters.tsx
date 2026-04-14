"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { storefrontCategories } from "@/lib/constants/categories";
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
    <section className="rounded-[30px] bg-white/90 p-5 shadow-[0_24px_60px_rgba(153,132,196,0.14)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a89b6]">Toy catalog</p>
      <h1 className="mt-1 text-3xl font-black tracking-tight text-[#40346f]">Explore toys by category</h1>
      <p className="mt-2 text-sm leading-6 text-[#6d6790]">
        Find the right toy faster with search, smart filters, and top picks.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <input
          className="h-12 rounded-full border border-[#eadff7] bg-white px-4 text-sm text-[#433870] outline-none placeholder:text-[#9f96bd]"
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

        <div className="grid grid-cols-[120px_1fr] gap-3">
          <Button
            onClick={() => {
              updateFilters({ search: searchInput });
              onSearchSubmit?.(searchInput);
            }}
          >
            Search
          </Button>
          <select
            className="h-12 rounded-full border border-[#eadff7] bg-white px-4 text-sm font-semibold text-[#4e4478] outline-none"
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

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        <button
          type="button"
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${selectedFeatured === "true" ? "bg-[#f4efff] text-[#6d5df6]" : "bg-[#fbf8ff] text-[#675d88]"}`}
          onClick={() => updateFilters({ featured: selectedFeatured === "true" ? "" : "true" })}
        >
          Best Sellers
        </button>
        {storefrontCategories.map((category) => (
          <button
            key={category}
            type="button"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${selectedCategory === category ? "bg-[#fff0f5] text-[#df628a]" : "bg-[#fbf8ff] text-[#675d88]"}`}
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

      {isPending ? <p className="mt-3 text-sm text-[#8b7fa8]">Refreshing the catalog...</p> : null}
    </section>
  );
}
