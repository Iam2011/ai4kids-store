import { cn } from "@/lib/utils/cn";

export function Badge({
  children,
  tone = "warm",
  className,
}: {
  children: React.ReactNode;
  tone?: "warm" | "soft" | "accent";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]",
        tone === "warm" && "bg-[#fff1de] text-[#d86f20]",
        tone === "soft" && "bg-[#f6efff] text-[#7b56d9]",
        tone === "accent" && "bg-[#ffe4ea] text-[#ef5c82]",
        className
      )}
    >
      {children}
    </span>
  );
}
