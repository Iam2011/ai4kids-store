import Image from "next/image";

export function AboutBlock() {
  return (
    <section className="rounded-[30px] bg-gradient-to-r from-[#f8ffd9] via-[#f7ffef] to-[#fff8ef] p-5 shadow-[0_24px_60px_rgba(171,196,110,0.2)]">
      <div className="flex items-start gap-4">
        <Image src="/logo.png" alt="AI4Kids" width={126} height={42} className="h-auto w-[116px]" />
        <div>
          <h2 className="text-xl font-black text-[#2b5a38]">Creative Learning Toys</h2>
          <p className="mt-2 text-sm leading-6 text-[#4f6d58]">
            Screen-free smart play, curated picks for gifting, and playful discovery families can trust.
          </p>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 text-sm font-semibold text-[#437349]">
        <li>Creative Learning Toys</li>
        <li>Screen-Free Smart Play</li>
        <li>Safe & Child-Friendly</li>
      </ul>
    </section>
  );
}
