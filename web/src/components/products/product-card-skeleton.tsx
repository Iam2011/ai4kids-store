export function ProductCardSkeleton() {
  return (
    <article className="animate-pulse rounded-[24px] bg-white p-3 shadow-[0_20px_50px_rgba(146,124,182,0.1)]">
      <div className="aspect-square rounded-[20px] bg-[#f4efff]" />
      <div className="mt-3 h-4 rounded-full bg-[#f4efff]" />
      <div className="mt-2 h-3 w-2/3 rounded-full bg-[#f4efff]" />
      <div className="mt-3 h-4 w-1/2 rounded-full bg-[#f4efff]" />
      <div className="mt-3 h-10 rounded-full bg-[#f4efff]" />
    </article>
  );
}
