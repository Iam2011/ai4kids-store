"use client";

import type { CheckoutCustomer } from "@/types/checkout";

export function CheckoutForm({
  value,
  onChange,
}: {
  value: CheckoutCustomer;
  onChange: (name: keyof CheckoutCustomer, nextValue: string) => void;
}) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-[0_24px_60px_rgba(153,132,196,0.15)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a89b6]">Checkout</p>
      <h1 className="mt-1 text-3xl font-black tracking-tight text-[#40346f]">Finish your order</h1>
      <p className="mt-2 text-sm leading-6 text-[#6d6790]">
        Enter delivery details, review your total, and place the order securely.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          { name: "name", label: "Full Name", placeholder: "Enter full name" },
          { name: "mobile", label: "Phone Number", placeholder: "10-digit mobile number" },
          { name: "pincode", label: "Pincode", placeholder: "6-digit pincode" },
          { name: "city", label: "City", placeholder: "Enter city" },
          { name: "state", label: "State", placeholder: "Select state" },
        ].map((field) => (
          <label key={field.name} className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[#4a3f75]">{field.label}</span>
            <input
              className="h-12 rounded-[18px] border border-[#eadff7] bg-white px-4 text-sm text-[#433870] outline-none"
              value={value[field.name as keyof CheckoutCustomer]}
              onChange={(event) => onChange(field.name as keyof CheckoutCustomer, event.target.value)}
              placeholder={field.placeholder}
            />
          </label>
        ))}

        <label className="sm:col-span-2 flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#4a3f75]">Address</span>
          <textarea
            className="min-h-[110px] rounded-[18px] border border-[#eadff7] bg-white px-4 py-3 text-sm text-[#433870] outline-none"
            value={value.address}
            onChange={(event) => onChange("address", event.target.value)}
            placeholder="House, street, landmark"
          />
        </label>
      </div>
    </div>
  );
}
