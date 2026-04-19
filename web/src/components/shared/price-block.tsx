import { formatPrice } from "@/lib/utils/format-price";

export function PriceBlock({
  price,
  originalPrice,
  discountPercent: _discountPercent,
}: {
  price: number;
  originalPrice?: number;
  discountPercent?: number;
}) {
  void _discountPercent;

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <strong className="text-[1.02rem] font-black text-[#2d2557]">{formatPrice(price)}</strong>
      {originalPrice && originalPrice > price ? (
        <span className="text-[12px] font-medium text-[#9788b3] line-through">{formatPrice(originalPrice)}</span>
      ) : null}
    </div>
  );
}
