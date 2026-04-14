import { Button } from "./button";

export function RetryState({
  text,
  onRetry,
}: {
  text: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[28px] bg-white/95 p-6 text-center shadow-[0_18px_40px_rgba(153,132,196,0.15)]">
      <p className="text-sm leading-6 text-[#6d6790]">{text}</p>
      <Button className="mt-4" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
