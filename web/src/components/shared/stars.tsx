import { cn } from "@/lib/utils/cn";

export function Stars({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5 text-[#ffbe31]", className)}
      aria-hidden="true"
    >
      <span>★</span>
      <span>★</span>
      <span>★</span>
      <span>★</span>
      <span className="text-[#dfd4f1]">★</span>
    </span>
  );
}
