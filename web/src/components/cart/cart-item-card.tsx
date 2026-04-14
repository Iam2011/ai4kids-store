"use client";

import Image from "next/image";
import { Button } from "@/components/shared/button";
import { formatPrice } from "@/lib/utils/format-price";
import type { CartItem } from "@/types/cart";
import { QuantityControl } from "./quantity-control";

export function CartItemCard({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <article className="grid grid-cols-[92px_1fr] gap-3 rounded-[26px] bg-white p-4 shadow-[0_18px_44px_rgba(148,123,191,0.12)]">
      <div className="relative aspect-square overflow-hidden rounded-[20px] bg-gradient-to-br from-[#fff8ef] to-[#f3f2ff]">
        <Image src={item.imageUrl} alt={item.name} fill sizes="96px" className="object-contain p-3" />
      </div>

      <div className="flex flex-col gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a89b6]">
            {item.itemType === "combo" ? "Combo Offer" : "In Cart"}
          </p>
          <h3 className="mt-1 text-base font-black leading-5 text-[#33285f]">{item.name}</h3>
          <p className="mt-1 text-xs text-[#7f769d]">
            {item.category} • Age {item.ageGroup}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <QuantityControl quantity={item.quantity} min={item.moq} onChange={onQuantityChange} />
          <div className="text-right">
            {item.originalPrice > item.price ? (
              <p className="text-xs text-[#aa9dbf] line-through">
                {formatPrice(item.originalPrice * item.quantity)}
              </p>
            ) : null}
            <strong className="text-base font-black text-[#312659]">
              {formatPrice(item.price * item.quantity)}
            </strong>
          </div>
        </div>

        <Button variant="secondary" className="h-10 px-3 text-xs" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </article>
  );
}
