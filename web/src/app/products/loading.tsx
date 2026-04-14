import { ProductCardSkeleton } from "@/components/products/product-card-skeleton";
import { PageContainer } from "@/components/shared/page-container";

export default function ProductsLoading() {
  return (
    <PageContainer>
      <section className="rounded-[30px] bg-white/90 p-5 shadow-[0_24px_60px_rgba(153,132,196,0.14)]">
        <div className="h-4 w-20 animate-pulse rounded-full bg-[#f1ebff]" />
        <div className="mt-3 h-10 w-52 animate-pulse rounded-[18px] bg-[#f1ebff]" />
        <div className="mt-3 h-5 w-full animate-pulse rounded-full bg-[#f7f3ff]" />
        <div className="mt-2 h-5 w-4/5 animate-pulse rounded-full bg-[#f7f3ff]" />
        <div className="mt-5 h-12 animate-pulse rounded-full bg-[#f7f3ff]" />
        <div className="mt-3 grid grid-cols-[120px_1fr] gap-3">
          <div className="h-12 animate-pulse rounded-full bg-[#f7f3ff]" />
          <div className="h-12 animate-pulse rounded-full bg-[#f7f3ff]" />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </PageContainer>
  );
}
