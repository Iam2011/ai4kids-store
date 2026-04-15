"use client";

import { Button } from "@/components/shared/button";
import { formatPrice } from "@/lib/utils/format-price";
import { formatProductName } from "@/lib/utils/normalize-product-text";
import type { CartItem } from "@/types/cart";
import type { PaymentMode } from "@/types/checkout";
import { PaymentOptionSelector } from "./payment-option-selector";

export function CheckoutSummary({
  items,
  subtotal,
  discount,
  total,
  codFee,
  paymentAmount,
  balanceDue,
  paymentMode,
  onPaymentModeChange,
  onSubmit,
  submitting,
  errorMessage,
}: {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  codFee: number;
  paymentAmount: number;
  balanceDue: number;
  paymentMode: PaymentMode;
  onPaymentModeChange: (mode: PaymentMode) => void;
  onSubmit: () => void;
  submitting: boolean;
  errorMessage: string;
}) {
  return (
    <aside className="rounded-[28px] bg-white p-5 shadow-[0_24px_60px_rgba(153,132,196,0.15)]">
      <h2 className="text-xl font-black text-[#40346f]">Payment summary</h2>
      <div className="mt-4 space-y-3 text-sm text-[#6d6790]">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <strong className="text-[#372b63]">{formatPrice(subtotal)}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Coupon discount</span>
          <strong className="text-[#372b63]">-{formatPrice(discount)}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Order total</span>
          <strong className="text-[#372b63]">{formatPrice(total)}</strong>
        </div>
        {paymentMode === "cod_deposit" ? (
          <div className="flex items-center justify-between">
            <span>Pay on delivery</span>
            <strong className="text-[#372b63]">{formatPrice(balanceDue || total)}</strong>
          </div>
        ) : null}
      </div>

      <div className="mt-5 space-y-2">
        {items.map((item) => (
          <div
            key={item.itemKey}
            className="flex items-center justify-between gap-3 text-sm text-[#6d6790]"
          >
            <span className="line-clamp-1">
              {formatProductName(item.name)} x {item.quantity}
            </span>
            <strong className="text-[#372b63]">{formatPrice(item.price * item.quantity)}</strong>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <PaymentOptionSelector value={paymentMode} onChange={onPaymentModeChange} />
      </div>

      {errorMessage ? <p className="mt-4 text-sm text-[#d04f76]">{errorMessage}</p> : null}

      <Button className="mt-5 w-full" onClick={onSubmit} disabled={submitting}>
        {submitting
          ? paymentMode === "cod_deposit"
            ? "Placing order..."
            : "Opening checkout..."
          : paymentAmount > 0
            ? `Pay ${formatPrice(paymentAmount)}`
            : "Place Order"}
      </Button>
    </aside>
  );
}
