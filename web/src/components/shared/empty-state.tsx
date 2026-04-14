import { Button } from "./button";

export function EmptyState({
  title,
  text,
  actionLabel,
  onAction,
}: {
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-[28px] bg-white/95 p-6 text-center shadow-[0_18px_40px_rgba(153,132,196,0.15)]">
      <h3 className="text-xl font-bold text-[#40346f]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6d6790]">{text}</p>
      {actionLabel && onAction ? (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
