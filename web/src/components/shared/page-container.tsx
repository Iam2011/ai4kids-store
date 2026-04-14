import { cn } from "@/lib/utils/cn";

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[460px] flex-col gap-5 px-4 pb-28 pt-5 sm:max-w-3xl sm:px-6 lg:max-w-6xl",
        className
      )}
    >
      {children}
    </div>
  );
}
