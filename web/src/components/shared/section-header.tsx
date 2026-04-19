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
    <div className="mb-3.5 flex items-start justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8e7ab8]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-[1.75rem] font-black tracking-tight text-[#2d2557]">{title}</h2>
      </div>
      {actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex min-h-9 items-center rounded-full border border-[#eadcf6] bg-[linear-gradient(180deg,#fff7fb_0%,#f7f0ff_100%)] px-3.5 text-[13px] font-semibold text-[#6a4dca] shadow-[0_10px_22px_rgba(135,108,191,0.12)]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
