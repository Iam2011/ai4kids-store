import { PageContainer } from "@/components/shared/page-container";
import { ProductCardSkeleton } from "@/components/products/product-card-skeleton";

export default function Loading() {
  return (
    <PageContainer>
      <div className="rounded-[30px] bg-white/90 p-5 shadow-[0_24px_60px_rgba(153,132,196,0.14)]">
        <div className="h-[220px] animate-pulse rounded-[24px] bg-[#f4efff]" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </PageContainer>
  );
}
