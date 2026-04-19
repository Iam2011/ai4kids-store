import * as React from "react";
import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition-transform duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-[linear-gradient(180deg,#3200fc_4%,#ff0065_98%)] text-white shadow-[0_14px_30px_rgba(98,54,255,0.22)]",
        variant === "secondary" &&
          "border border-[#eadcf4] bg-[linear-gradient(180deg,#ffffff_0%,#f8f3ff_100%)] text-[#4a3f75] shadow-[0_12px_24px_rgba(139,116,180,0.12)]",
        variant === "ghost" && "bg-transparent text-[#6d6790]",
        className
      )}
      {...props}
    />
  );
}
