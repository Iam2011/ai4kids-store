"use client";

import { ProductFilters } from "@/components/products/product-filters";
import { ProductGrid } from "@/components/products/product-grid";
import { PageContainer } from "@/components/shared/page-container";
import { RetryState } from "@/components/shared/retry-state";
import { EmptyState } from "@/components/shared/empty-state";
import { trackStoreEvent } from "@/lib/analytics/track";
import { listingCopy } from "@/lib/constants/copy";
import type { Product } from "@/types/product";
import { useRouter } from "next/navigation";

type ProductsClientPageProps = {
  initialProducts: Product[];
  initialError?: string;
};

export function ProductsClientPage({
  initialProducts,
  initialError = "",
}: ProductsClientPageProps) {
  const router = useRouter();

  return (
    <PageContainer>
      <ProductFilters
        onSearchSubmit={(term) => {
          if (!String(term || "").trim()) return;
          void trackStoreEvent({
            eventType: "search_submit",
            searchTerm: term.trim(),
          }).catch(() => {});
        }}
      />

      {initialError ? (
        <RetryState text={initialError} onRetry={() => router.refresh()} />
      ) : initialProducts.length ? (
        <ProductGrid products={initialProducts} />
      ) : (
        <EmptyState title="No toys found" text={listingCopy.empty} />
      )}
    </PageContainer>
  );
}
