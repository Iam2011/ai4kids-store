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
    <section className="relative overflow-hidden rounded-[24px] shadow-[0_24px_60px_rgba(121,84,177,0.25)]">
      <button
        type="button"
        onClick={handleClick}
        className="relative block aspect-video w-full overflow-hidden text-left"
      >
        <Image
          src="/assets/ui/hero-mobile-reference.png"
          alt="AI4Kids combo hero banner"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 720px"
          className="object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <Button className="shadow-[0_16px_40px_rgba(255,132,85,0.38)]">Shop Now</Button>
        </div>
      </button>
    </section>
  );
}
