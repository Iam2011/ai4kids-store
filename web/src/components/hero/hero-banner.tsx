"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/button";
import { trackStoreEvent } from "@/lib/analytics/track";

type HeroProduct = {
  src: string;
  alt: string;
  label: string;
  labelClassName: string;
  pedestalClassName: string;
  shadowClassName: string;
  wrapperClassName: string;
};

const heroProducts: HeroProduct[] = [
  {
    src: "/assets/hero/live-2026/drone.png",
    alt: "Drone toy",
    label: "Drone",
    wrapperClassName:
      "left-[66%] top-[12%] z-[5] w-[29%] lg:left-[73%] lg:top-[18%] lg:w-[22.5%]",
    pedestalClassName:
      "h-[22%] w-[84%] bg-[linear-gradient(180deg,#eef5ff_0%,#dbe8ff_62%,#cfdfff_100%)] lg:w-[82%]",
    shadowClassName: "h-[9%] w-[68%]",
    labelClassName: "w-fit min-w-[96px] bg-[#2d6dff]",
  },
  {
    src: "/assets/hero/live-2026/jcb.png",
    alt: "Metal JCB toy",
    label: "Metal JCB",
    wrapperClassName:
      "left-[4%] top-[51%] z-[3] w-[27%] lg:left-[42%] lg:top-[29%] lg:w-[19%]",
    pedestalClassName:
      "h-[23%] w-[88%] bg-[linear-gradient(180deg,#fff8db_0%,#fff0be_62%,#ffe6a3_100%)] lg:h-[24%]",
    shadowClassName: "h-[9%] w-[68%]",
    labelClassName: "w-fit min-w-[112px] bg-[#ffb312]",
  },
  {
    src: "/assets/hero/live-2026/sweet-house.png",
    alt: "Sweet House toy",
    label: "Sweet House",
    wrapperClassName:
      "left-[50%] top-[48%] z-[4] w-[45%] -translate-x-1/2 lg:left-[52%] lg:top-[39%] lg:w-[30%]",
    pedestalClassName:
      "h-[25%] w-[92%] bg-[linear-gradient(180deg,#fff1f7_0%,#ffe2f0_60%,#f6d7eb_100%)]",
    shadowClassName: "h-[10%] w-[72%]",
    labelClassName: "w-fit min-w-[124px] bg-[#ff4f7b]",
  },
  {
    src: "/assets/hero/live-2026/defender-suv.png",
    alt: "Land Defender SUV toy",
    label: "Land Defender SUV",
    wrapperClassName:
      "left-[3%] top-[78%] z-[2] w-[33%] lg:left-[28%] lg:top-[69%] lg:w-[22%]",
    pedestalClassName:
      "h-[23%] w-[88%] bg-[linear-gradient(180deg,#e9fbf2_0%,#d8f8e7_60%,#c7f2d7_100%)]",
    shadowClassName: "h-[9%] w-[68%]",
    labelClassName: "w-fit min-w-[160px] bg-[#17b673]",
  },
  {
    src: "/assets/hero/live-2026/royal-enfield.png",
    alt: "Royal Enfield Classic 350 toy",
    label: "Royal Enfield Classic 350",
    wrapperClassName:
      "left-[63%] top-[80%] z-[2] w-[31%] lg:left-[73%] lg:top-[72%] lg:w-[21%]",
    pedestalClassName:
      "h-[23%] w-[90%] bg-[linear-gradient(180deg,#e8fbf5_0%,#d9f8ed_60%,#caf6e4_100%)]",
    shadowClassName: "h-[9%] w-[70%]",
    labelClassName: "w-fit min-w-[196px] bg-[#19b98b]",
  },
];

export function HeroBanner() {
  const router = useRouter();

  const handleExplore = async () => {
    await trackStoreEvent({
      eventType: "hero_click",
      category: {
        categoryLabel: "Explore Toys",
      },
    }).catch(() => {});

    router.push("/products");
  };

  return (
    <section className="overflow-hidden rounded-[32px] border border-white/80 bg-[linear-gradient(135deg,rgba(251,246,255,0.98),rgba(255,245,249,0.95)_48%,rgba(246,240,255,0.97))]">
      <div className="relative overflow-hidden rounded-[32px] px-[18px] pb-[28px] pt-5 sm:px-6 sm:pb-8 sm:pt-6 lg:px-10 lg:pb-10 lg:pt-8">
        <div className="relative z-10 min-h-[860px] lg:min-h-[620px]">
          <div className="max-w-[272px] sm:max-w-[320px] lg:max-w-[520px]">
            <HeroBadge />

            <h1 className="mt-[18px] max-w-[270px] text-[clamp(32px,8vw,54px)] font-[800] leading-[0.95] tracking-[-0.05em] text-[#1d1b62] sm:max-w-[320px] lg:mt-6 lg:max-w-[500px] lg:text-[clamp(72px,7vw,92px)]">
              <span className="block">Play Smarter.</span>
              <span className="block bg-gradient-to-r from-[#7a48ff] to-[#5b2ff4] bg-clip-text text-transparent">
                Grow Faster.
              </span>
            </h1>

            <p className="mt-4 max-w-[268px] text-[16px] leading-[1.55] text-[#6b6a95] sm:max-w-[296px] sm:text-[17px] lg:mt-6 lg:max-w-[360px] lg:text-[18px] lg:leading-9">
              Carefully selected toys that boost creativity, learning, and fun.
            </p>

            <div className="mt-5 sm:mt-6 lg:mt-8">
              <Button
                onClick={handleExplore}
                className="min-h-[50px] w-fit rounded-[999px] px-6 text-[17px] font-semibold lg:min-h-[54px] lg:px-8 lg:text-[18px]"
              >
                Explore Toys
                <span className="ml-2 text-base leading-none lg:text-lg" aria-hidden="true">
                  &rarr;
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="relative mx-auto min-h-[860px] w-full max-w-[430px] overflow-visible lg:min-h-[620px] lg:max-w-none">
            {heroProducts.map((product) => (
              <ProductStage key={product.label} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductStage({ product }: { product: HeroProduct }) {
  return (
      <div className={`absolute ${product.wrapperClassName}`}>
      <div className="relative flex justify-center pb-[16%]">
        <div
          className={`absolute left-1/2 bottom-[10%] -translate-x-1/2 rounded-[999px] ${product.pedestalClassName}`}
        />
        <div
          className={`absolute left-1/2 bottom-[6%] -translate-x-1/2 rounded-full bg-[rgba(75,58,127,0.14)] blur-[14px] ${product.shadowClassName}`}
        />

        <Image
          src={product.src}
          alt={product.alt}
          width={480}
          height={480}
          priority
          className="relative z-10 h-auto w-full object-contain"
          sizes="(max-width: 1024px) 45vw, 24vw"
        />

        <div className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2">
          <div
            className={`inline-flex min-h-[32px] items-center justify-center rounded-full px-3 py-2 text-center text-[13px] font-semibold leading-none text-white lg:min-h-[34px] lg:px-4 lg:text-[14px] ${product.labelClassName}`}
          >
            {product.label}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/92 px-[14px] py-2 text-[14px] font-semibold text-[#5b45d3]">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#efe7ff] text-[#724cff]">
        <StarIcon className="h-3 w-3" />
      </span>
      Smart Toys for Smart Kids
    </div>
  );
}

function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current ${className}`} aria-hidden="true">
      <path d="M12 2.5l2.87 5.82 6.42.93-4.64 4.52 1.1 6.4L12 17.15l-5.75 3.02 1.1-6.4L2.71 9.25l6.42-.93L12 2.5z" />
    </svg>
  );
}
