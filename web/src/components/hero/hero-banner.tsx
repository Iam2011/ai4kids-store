"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/button";
import { viralToysCombo } from "@/lib/constants/combo-offer";
import { trackStoreEvent } from "@/lib/analytics/track";
import { useCart } from "@/components/providers/cart-provider";

export function HeroBanner() {
  const router = useRouter();
  const { addCombo } = useCart();

  const handleClick = async () => {
    await trackStoreEvent({
      eventType: "hero_click",
      category: {
        categoryLabel: "Combo Offer",
      },
    }).catch(() => {});
    addCombo(viralToysCombo);
    router.push("/checkout");
  };

  return (
    <section className="rounded-[28px] border border-white/90 bg-white/88 p-3 shadow-[0_22px_52px_rgba(191,164,228,0.26)]">
      <button type="button" onClick={handleClick} className="block w-full text-left">
        <div className="relative aspect-video overflow-hidden rounded-[26px] border border-white/70 shadow-[0_22px_48px_rgba(173,141,223,0.24)]">
          <Image
            src="/assets/ui/home/hero-inner-reference-crop-v3.png"
            alt="AI4Kids combo hero banner"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover object-center -translate-y-1 scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 px-4">
            <Button className="min-h-10 min-w-[148px] rounded-[999px] px-8 py-2 text-base shadow-[0_16px_38px_rgba(144,108,255,0.32)]">
              Shop Now
            </Button>
            <div className="rounded-[18px] border border-white/75 bg-white/88 px-5 py-2 text-center text-sm font-semibold text-[#746a96] shadow-[0_14px_28px_rgba(183,156,224,0.22)] backdrop-blur">
              Combo Offer: Get all 3 toys for <span className="font-black text-[#6d5df6]">₹3999</span>
            </div>
          </div>
        </div>
      </button>
    </section>
  );
}
