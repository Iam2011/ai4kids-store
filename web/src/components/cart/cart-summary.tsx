"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/button";
import { formatPrice } from "@/lib/utils/format-price";

export function CartSummary({
  subtotal,
  discount,
  total,
}: {
  subtotal: number;
  discount: number;
  total: number;
}) {
  const router = useRouter();

  return (
    <aside className="rounded-[28px] bg-white p-5 shadow-[0_24px_60px_rgba(153,132,196,0.15)]">
      <h2 className="text-xl font-black text-[#40346f]">Order summary</h2>
      <div className="mt-4 space-y-3 text-sm text-[#6d6790]">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <strong className="text-[#372b63]">{formatPrice(subtotal)}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Coupon discount</span>
          <strong className="text-[#372b63]">-{formatPrice(discount)}</strong>
        </div>
        <p className="rounded-[18px] bg-[#fff8ef] px-3 py-2 text-xs leading-5 text-[#8e6d54]">
          Cash on Delivery orders now place directly without any advance payment.
        </p>
        <div className="flex items-center justify-between border-t border-[#efe6fb] pt-3 text-base">
          <span className="font-semibold text-[#40346f]">Total</span>
          <strong className="text-xl font-black text-[#2f2557]">{formatPrice(total)}</strong>
        </div>
      </div>
      <Button className="mt-5 w-full" onClick={() => router.push("/checkout")}>
        Proceed to Checkout
      </Button>
    </aside>
  );
}
