import { formatPrice } from "@/lib/utils/format-price";

export function PriceBlock({
  price,
  originalPrice,
  discountPercent,
}: {
  price: number;
  originalPrice?: number;
  discountPercent?: number;
}) {
  return (
    <div className="flex items-end gap-2">
      <strong className="text-lg font-black text-[#2d2557]">{formatPrice(price)}</strong>
      {originalPrice && originalPrice > price ? (
        <span className="text-sm text-[#9a89b6] line-through">{formatPrice(originalPrice)}</span>
      ) : null}
      {discountPercent ? (
        <span className="rounded-full bg-[#ffede7] px-2 py-1 text-[11px] font-bold text-[#ff6f48]">
          {discountPercent}% OFF
        </span>
      ) : null}
    </div>
  );
}
