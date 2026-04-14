"use client";

export function QuantityControl({
  quantity,
  min = 1,
  onChange,
}: {
  quantity: number;
  min?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f0ff] p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-bold text-[#5a4f84]"
      >
        -
      </button>
      <span className="min-w-8 text-center text-sm font-bold text-[#433870]">{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-bold text-[#5a4f84]"
      >
        +
      </button>
    </div>
  );
}
