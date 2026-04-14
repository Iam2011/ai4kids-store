import { PageContainer } from "@/components/shared/page-container";

export function PolicyPage({
  eyebrow,
  title,
  paragraphs,
}: {
  eyebrow: string;
  title: string;
  paragraphs: string[];
}) {
  return (
    <PageContainer>
      <section className="rounded-[30px] bg-white/95 p-6 shadow-[0_24px_60px_rgba(153,132,196,0.15)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a89b6]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black text-[#40346f]">{title}</h1>
        <div className="mt-4 space-y-4 text-sm leading-7 text-[#6d6790]">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
