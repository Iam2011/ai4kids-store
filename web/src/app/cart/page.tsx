"use client";

import { useCart } from "@/components/providers/cart-provider";
import { CartItemCard } from "@/components/cart/cart-item-card";
import { CartSummary } from "@/components/cart/cart-summary";
import { TrustMarkers } from "@/components/trust/trust-markers";
import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { calculateCodConfirmationFee, getPreviewTotal } from "@/lib/utils/pricing";

export default function CartPage() {
  const { items, subtotal, coupon, updateQuantity, removeItem } = useCart();

  if (!items.length) {
    return (
      <PageContainer>
        <EmptyState
          title="Your cart is empty"
          text="Add a few toys and come back here to unlock checkout."
        />
      </PageContainer>
    );
  }

  const previewDiscount = coupon?.discountAmount || 0;
  const previewTotal = getPreviewTotal(subtotal, previewDiscount);
  const codConfirmationFee = calculateCodConfirmationFee(items);

  return (
    <PageContainer>
      <section className="rounded-[30px] bg-white/90 p-5 shadow-[0_24px_60px_rgba(153,132,196,0.14)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a89b6]">Cart</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-[#40346f]">
          Review your toys before checkout
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#6d6790]">
          Check quantities, review pricing, and see the COD confirmation fee before you pay.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-3">
          {items.map((item) => (
            <CartItemCard
              key={item.itemKey}
              item={item}
              onQuantityChange={(value) => updateQuantity(item.itemKey, value)}
              onRemove={() => removeItem(item.itemKey)}
            />
          ))}
        </section>
        <CartSummary
          subtotal={subtotal}
          discount={previewDiscount}
          codFee={codConfirmationFee}
          total={previewTotal}
        />
      </div>

      <TrustMarkers />
    </PageContainer>
  );
}
