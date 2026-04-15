"use client";

import { cn } from "@/lib/utils/cn";
import type { PaymentMode } from "@/types/checkout";

export function PaymentOptionSelector({
  value,
  onChange,
}: {
  value: PaymentMode;
  onChange: (value: PaymentMode) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange("cod_deposit")}
        className={cn(
          "rounded-[24px] border px-4 py-4 text-left shadow-[0_12px_30px_rgba(148,123,191,0.1)]",
          value === "cod_deposit"
            ? "border-[#ff9c79] bg-[#fff2ea]"
            : "border-[#ede4fb] bg-white"
        )}
      >
        <strong className="block text-sm text-[#3e336c]">Cash on Delivery</strong>
        <span className="mt-1 block text-xs text-[#7f769d]">Pay on delivery. No advance payment.</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("full_payment")}
        className={cn(
          "rounded-[24px] border px-4 py-4 text-left shadow-[0_12px_30px_rgba(148,123,191,0.1)]",
          value === "full_payment"
            ? "border-[#8a77ff] bg-[#f5f1ff]"
            : "border-[#ede4fb] bg-white"
        )}
      >
        <strong className="block text-sm text-[#3e336c]">Pay Now</strong>
        <span className="mt-1 block text-xs text-[#7f769d]">Pay full amount securely</span>
      </button>
    </div>
  );
}
