import Image from "next/image";

export function AboutBlock() {
  return (
    <section className="rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(255,247,252,0.95))] p-5 shadow-[0_24px_54px_rgba(185,153,224,0.16)]">
      <div className="rounded-[24px] border border-[#f2e7fb] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(255,245,251,0.94)_60%,rgba(248,243,255,0.95))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
        <div className="flex items-start gap-4">
          <div className="rounded-[18px] bg-white/90 p-3 shadow-[0_14px_32px_rgba(187,153,224,0.14)]">
            <Image src="/logo.png" alt="AI4Kids" width={126} height={42} className="h-auto w-[108px]" />
          </div>
          <div className="flex-1">
            <h2 className="text-[1.3rem] font-black leading-6 text-[#46356f]">Why families choose AI4Kids</h2>
            <p className="mt-2 text-sm leading-6 text-[#7a6e99]">
              Smart picks for gifting, playful learning, and trusted doorstep delivery in one joyful storefront.
            </p>
          </div>
        </div>

        <ul className="mt-4 grid gap-2 text-sm font-semibold text-[#5d4d86]">
          <li className="rounded-full bg-[#f7f0ff] px-3 py-2">Creative learning toys for curious kids</li>
          <li className="rounded-full bg-[#fff2eb] px-3 py-2">Screen-free play ideas parents can trust</li>
          <li className="rounded-full bg-[#eef9ff] px-3 py-2">Fast dispatch and easy gifting picks</li>
        </ul>
      </div>
    </section>
  );
}
