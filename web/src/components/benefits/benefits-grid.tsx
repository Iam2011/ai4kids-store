import Image from "next/image";

export function BenefitsGrid() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/82 shadow-[0_20px_48px_rgba(193,165,231,0.24)]">
      <Image
        src="/assets/ui/home/benefits-strip-reference-crop.png"
        alt="Top sellers, secure payments, exciting offers, and swift delivery"
        width={1320}
        height={365}
        sizes="(max-width: 768px) 100vw, 720px"
        className="h-auto w-full"
      />
    </section>
  );
}
