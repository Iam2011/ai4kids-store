import Link from "next/link";

export function SectionHeader({
  title,
  eyebrow,
  actionHref,
  actionLabel = "View All",
}: {
  title: string;
  eyebrow?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#9a89b6]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-black tracking-tight text-[#40346f]">{title}</h2>
      </div>
      {actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex min-h-10 items-center rounded-full bg-[#fff0f5] px-4 text-sm font-semibold text-[#d2678f]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
