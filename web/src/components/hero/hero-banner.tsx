"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/button";
import { trackStoreEvent } from "@/lib/analytics/track";

const heroProducts = {
  drone: {
    src: "/assets/hero/live-2026/drone.png",
    alt: "Drone toy",
    label: "Drone",
    accent: "from-[#5d9cff] to-[#2d6dff]",
    pedestal: "from-[#ebf3ff] via-[#dbe9ff] to-[#cfe0ff]",
    halo: "bg-[radial-gradient(circle,rgba(93,156,255,0.24),rgba(255,255,255,0)_74%)]",
  },
  house: {
    src: "/assets/hero/live-2026/sweet-house.png",
    alt: "Sweet House toy",
    label: "Sweet House",
    accent: "from-[#ff719f] to-[#ff4f7b]",
    pedestal: "from-[#fff0f7] via-[#ffe2f0] to-[#f6d7eb]",
    halo: "bg-[radial-gradient(circle,rgba(255,123,165,0.18),rgba(203,189,255,0.14)_46%,rgba(255,255,255,0)_74%)]",
  },
  jcb: {
    src: "/assets/hero/live-2026/jcb.png",
    alt: "Metal JCB toy",
    label: "Metal JCB",
    accent: "from-[#ffcf3b] to-[#ffad14]",
    pedestal: "from-[#fff8db] via-[#fff0be] to-[#ffe6a3]",
    halo: "bg-[radial-gradient(circle,rgba(255,208,67,0.24),rgba(255,255,255,0)_74%)]",
  },
  defender: {
    src: "/assets/hero/live-2026/defender-suv.png",
    alt: "Land Defender SUV toy",
    label: "Land Defender SUV",
    accent: "from-[#27c689] to-[#17b673]",
    pedestal: "from-[#e9fbf2] via-[#d8f8e7] to-[#c7f2d7]",
    halo: "bg-[radial-gradient(circle,rgba(39,198,137,0.18),rgba(255,255,255,0)_74%)]",
  },
  bike: {
    src: "/assets/hero/live-2026/royal-enfield.png",
    alt: "Royal Enfield Classic 350 toy",
    label: "Royal Enfield Classic 350",
    accent: "from-[#25c8a8] to-[#19b98b]",
    pedestal: "from-[#e8fbf5] via-[#d9f8ed] to-[#caf6e4]",
    halo: "bg-[radial-gradient(circle,rgba(37,200,168,0.16),rgba(255,255,255,0)_74%)]",
  },
};

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
    <section className="overflow-hidden rounded-[24px] border border-white/80 bg-[linear-gradient(135deg,rgba(252,247,255,0.98),rgba(255,244,249,0.95)_48%,rgba(246,240,255,0.97))] shadow-[0_24px_56px_rgba(186,156,226,0.2)] sm:rounded-[28px] lg:rounded-[34px]">
      <div className="relative overflow-hidden rounded-[24px] border border-white/75 px-[18px] pb-[22px] pt-5 sm:px-6 sm:pb-7 sm:pt-6 lg:rounded-[34px] lg:px-10 lg:pb-10 lg:pt-8">
        <HeroBackdrop />

        <div className="relative z-10 flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(380px,46%)_minmax(420px,54%)] lg:items-center lg:gap-10">
          <div className="lg:max-w-[520px]">
            <HeroBadge />
            <h1 className="mt-[18px] max-w-[260px] text-[clamp(32px,8vw,54px)] font-[800] leading-[0.96] tracking-[-0.05em] text-[#1d1b62] lg:mt-6 lg:max-w-[500px] lg:text-[clamp(72px,7vw,92px)]">
              <span className="block">Play Smarter.</span>
              <span className="block bg-gradient-to-r from-[#7a48ff] to-[#5b2ff4] bg-clip-text text-transparent">
                Grow Faster.
              </span>
            </h1>
            <p className="mt-4 max-w-[270px] text-[15px] leading-[1.55] text-[#6b6a95] sm:text-[16px] lg:mt-6 lg:max-w-[360px] lg:text-[18px] lg:leading-9">
              Carefully selected toys that boost creativity, learning, and fun.
            </p>
            <div className="mt-[18px] lg:mt-8">
              <Button
                onClick={handleExplore}
                className="min-h-[50px] w-fit rounded-[999px] px-6 text-[17px] font-semibold shadow-[0_16px_32px_rgba(123,72,255,0.24)] lg:min-h-[54px] lg:px-8 lg:text-[18px]"
              >
                Explore Toys
              </Button>
            </div>
          </div>

          <div className="relative mt-1 min-h-[560px] w-full overflow-visible lg:mt-0 lg:h-[620px] lg:min-h-[620px]">
            <VisualBackdrop />
            <ConnectorPaths />
            <SparkleField />

            <ProductStage
              className="absolute right-[2%] top-[14px] z-30 w-[31%] lg:right-[5%] lg:top-[18px] lg:w-[29%]"
              product={heroProducts.drone}
              imageClassName="hero-float-drone w-[100%]"
              pedestalClassName="h-[56px] w-[148px] lg:h-[82px] lg:w-[220px]"
              labelClassName="w-[96px] text-[13px] lg:w-[108px] lg:text-[14px]"
            />

            <ProductStage
              className="absolute left-1/2 top-[154px] z-20 w-[46%] -translate-x-1/2 lg:left-[51%] lg:top-[110px] lg:w-[44%]"
              product={heroProducts.house}
              imageClassName="hero-float-house w-[100%]"
              pedestalClassName="h-[82px] w-[214px] lg:h-[118px] lg:w-[318px]"
              labelClassName="w-[130px] text-[13px] lg:w-[148px] lg:text-[14px]"
              shadowClassName="h-8 w-[68%] lg:h-10"
            />

            <ProductStage
              className="absolute left-[4%] top-[272px] z-20 w-[27%] lg:left-[8%] lg:top-[130px] lg:w-[26%]"
              product={heroProducts.jcb}
              imageClassName="hero-float-jcb w-[100%]"
              pedestalClassName="h-[52px] w-[132px] lg:h-[78px] lg:w-[204px]"
              labelClassName="w-[104px] text-[13px] lg:w-[126px] lg:text-[14px]"
            />

            <ProductStage
              className="absolute bottom-[42px] left-[5%] z-20 w-[29%] lg:bottom-[34px] lg:left-[6%] lg:w-[30%]"
              product={heroProducts.defender}
              imageClassName="hero-float-defender w-[100%]"
              pedestalClassName="h-[56px] w-[160px] lg:h-[80px] lg:w-[232px]"
              labelClassName="w-[142px] text-[13px] lg:w-[176px] lg:text-[14px]"
            />

            <ProductStage
              className="absolute bottom-[44px] right-[3%] z-20 w-[31%] lg:bottom-[36px] lg:right-[5%] lg:w-[31%]"
              product={heroProducts.bike}
              imageClassName="hero-float-bike w-[100%]"
              pedestalClassName="h-[56px] w-[164px] lg:h-[80px] lg:w-[228px]"
              labelClassName="w-[154px] text-[13px] lg:w-[204px] lg:text-[14px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductStage({
  className,
  product,
  imageClassName,
  pedestalClassName,
  labelClassName,
  shadowClassName = "h-7 w-[64%]",
}: {
  className: string;
  product: (typeof heroProducts)[keyof typeof heroProducts];
  imageClassName: string;
  pedestalClassName: string;
  labelClassName: string;
  shadowClassName?: string;
}) {
  return (
    <div className={className}>
      <div className="relative flex justify-center">
        <div
          className={`absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[10px] ${product.halo}`}
        />
        <div
          className={`absolute left-1/2 top-[72%] -translate-x-1/2 rounded-[999px] bg-gradient-to-b shadow-[0_20px_42px_rgba(100,78,154,0.08)] ${product.pedestal} ${pedestalClassName}`}
        >
          <div className="absolute inset-x-[11%] top-3 h-[18%] rounded-full bg-white/75 blur-[2px]" />
        </div>
        <div
          className={`absolute left-1/2 top-[78%] -translate-x-1/2 rounded-full bg-[rgba(75,58,127,0.16)] blur-[15px] ${shadowClassName}`}
        />

        <Image
          src={product.src}
          alt={product.alt}
          width={420}
          height={420}
          sizes="(max-width: 1024px) 45vw, 26vw"
          priority
          className={`relative z-10 h-auto [filter:drop-shadow(0_18px_30px_rgba(50,40,100,0.14))] ${imageClassName}`}
        />

        <div
          className={`absolute left-1/2 z-20 -translate-x-1/2 rounded-full bg-gradient-to-r px-3 py-2 text-center font-semibold text-white shadow-[0_12px_24px_rgba(104,75,183,0.22)] ${product.accent} ${labelClassName}`}
          style={{ bottom: "-12px" }}
        >
          <span className="flex items-center justify-center gap-1.5 whitespace-nowrap">
            <LabelDot />
            {product.label}
          </span>
        </div>
      </div>
    </div>
  );
}

function HeroBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/92 px-[14px] py-2 text-[14px] font-semibold text-[#5b45d3] shadow-[0_14px_24px_rgba(175,145,220,0.1)]">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#efe7ff] text-[#724cff]">
        <StarIcon className="h-3 w-3" />
      </span>
      Smart Toys for Smart Kids
    </div>
  );
}

function HeroBackdrop() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(251,246,255,0.98),rgba(255,245,249,0.95)_48%,rgba(246,240,255,0.97))]" />
      <div className="pointer-events-none absolute left-[12%] top-[9%] h-28 w-28 rounded-full bg-[#efe6ff] opacity-75 blur-[18px] lg:h-40 lg:w-40" />
      <div className="pointer-events-none absolute right-[10%] top-[12%] h-24 w-24 rounded-full bg-[#fff0dc] opacity-80 blur-[18px] lg:h-36 lg:w-36" />
      <div className="pointer-events-none absolute bottom-[12%] left-[52%] h-32 w-32 rounded-full bg-[#f0ebff] opacity-70 blur-[20px] lg:h-44 lg:w-44" />
    </>
  );
}

function VisualBackdrop() {
  return (
    <>
      <div className="absolute left-[42%] top-[22%] h-[220px] w-[220px] -translate-x-1/2 rounded-full bg-[#efe5ff] opacity-80 blur-[16px] lg:left-[52%] lg:top-[24%] lg:h-[320px] lg:w-[320px]" />
      <div className="absolute right-[6%] top-[6%] h-[118px] w-[118px] rounded-full bg-[#dfeaff] opacity-85 blur-[12px] lg:h-[165px] lg:w-[165px]" />
      <div className="absolute left-[2%] top-[44%] h-[116px] w-[116px] rounded-full bg-[#fff2cc] opacity-80 blur-[12px] lg:left-[6%] lg:top-[18%] lg:h-[156px] lg:w-[156px]" />
      <div className="absolute bottom-[14%] left-[2%] h-[118px] w-[118px] rounded-full bg-[#def9e8] opacity-80 blur-[14px] lg:left-[4%] lg:h-[152px] lg:w-[152px]" />
      <div className="absolute bottom-[16%] right-[2%] h-[118px] w-[118px] rounded-full bg-[#def9ef] opacity-75 blur-[14px] lg:right-[4%] lg:h-[152px] lg:w-[152px]" />
    </>
  );
}

function ConnectorPaths() {
  return (
    <svg
      viewBox="0 0 1000 700"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <path
        d="M748 108c56 20 95 58 92 109-2 35-30 62-74 82"
        fill="none"
        stroke="rgba(243,189,92,0.48)"
        strokeWidth="3"
        strokeDasharray="8 14"
        strokeLinecap="round"
      />
      <path
        d="M263 350c54-48 112-63 191-40 45 13 72 18 115 4"
        fill="none"
        stroke="rgba(255,151,186,0.4)"
        strokeWidth="3"
        strokeDasharray="6 14"
        strokeLinecap="round"
      />
      <path
        d="M270 560c101-53 201-53 330-10 50 17 103 16 163-2"
        fill="none"
        stroke="rgba(144,112,255,0.34)"
        strokeWidth="3"
        strokeDasharray="6 16"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkleField() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <Sparkle className="hero-sparkle absolute left-[12%] top-[8%] text-[#a490ff]" />
      <Sparkle className="hero-sparkle absolute left-[54%] top-[32%] text-[#c39cff]" />
      <Sparkle className="hero-sparkle absolute right-[9%] top-[24%] text-[#9c90ff]" />
      <Sparkle className="hero-sparkle absolute right-[8%] top-[56%] text-[#ffa3c7]" />
      <Sparkle className="hero-sparkle absolute left-[24%] bottom-[28%] text-[#ff9bbd]" />

      <div className="absolute left-[34%] top-[15%] grid grid-cols-4 gap-2 opacity-60 lg:left-[24%]">
        {Array.from({ length: 12 }).map((_, index) => (
          <span key={index} className="h-1.5 w-1.5 rounded-full bg-[#9e8bf7]" />
        ))}
      </div>
    </div>
  );
}

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 fill-current lg:h-5 lg:w-5 ${className}`} aria-hidden="true">
      <path d="M12 1.5l2.14 6.36L20.5 10l-6.36 2.14L12 18.5l-2.14-6.36L3.5 10l6.36-2.14L12 1.5z" />
    </svg>
  );
}

function LabelDot() {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/18">
      <span className="h-1.5 w-1.5 rounded-full bg-white" />
    </span>
  );
}

function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current ${className}`} aria-hidden="true">
      <path d="M12 2.5l2.87 5.82 6.42.93-4.64 4.52 1.1 6.4L12 17.15l-5.75 3.02 1.1-6.4L2.71 9.25l6.42-.93L12 2.5z" />
    </svg>
  );
}
