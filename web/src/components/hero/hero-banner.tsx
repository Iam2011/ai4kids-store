"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/button";
import { trackStoreEvent } from "@/lib/analytics/track";

type StageConfig = {
  key: string;
  label: string;
  alt: string;
  src: string;
  className: string;
  podiumClassName: string;
  labelClassName: string;
  imageClassName: string;
  shadowClassName: string;
  imageSizes: string;
};

const mobileStages: StageConfig[] = [
  {
    key: "drone",
    label: "Drone",
    alt: "Drone toy",
    src: "/assets/hero/live-2026/drone.png",
    className: "left-[58%] top-[26%] z-[30] w-[37%]",
    podiumClassName:
      "h-[16.5%] w-[100%] bg-[linear-gradient(180deg,#eef5ff_0%,#dbe8ff_60%,#c9d9ff_100%)]",
    labelClassName: "bg-[#2d6dff] min-w-[92px]",
    imageClassName: "hero-float-drone bottom-[18%] w-[90%]",
    shadowClassName: "bottom-[13%] h-[8%] w-[72%]",
    imageSizes: "(max-width: 1024px) 30vw, 18vw",
  },
  {
    key: "jcb",
    label: "Metal JCB",
    alt: "Metal JCB toy",
    src: "/assets/hero/live-2026/jcb.png",
    className: "left-[4.5%] top-[56.8%] z-[24] w-[33.5%]",
    podiumClassName:
      "h-[16%] w-[100%] bg-[linear-gradient(180deg,#fff8dc_0%,#ffefb5_60%,#ffe59f_100%)]",
    labelClassName: "bg-[#ffb312] min-w-[108px]",
    imageClassName: "hero-float-jcb bottom-[17%] w-[91%]",
    shadowClassName: "bottom-[12%] h-[7.5%] w-[72%]",
    imageSizes: "(max-width: 1024px) 28vw, 14vw",
  },
  {
    key: "house",
    label: "Sweet House",
    alt: "Sweet House toy",
    src: "/assets/hero/live-2026/sweet-house.png",
    className: "left-[44%] top-[55.5%] z-[22] w-[49%]",
    podiumClassName:
      "h-[18.5%] w-[100%] bg-[linear-gradient(180deg,#fff1f7_0%,#ffdce8_58%,#ffcfe1_100%)]",
    labelClassName: "bg-[#ff4f7b] min-w-[122px]",
    imageClassName: "hero-float-house bottom-[12%] w-[95%]",
    shadowClassName: "bottom-[10%] h-[9%] w-[76%]",
    imageSizes: "(max-width: 1024px) 42vw, 22vw",
  },
  {
    key: "defender",
    label: "Land Defender SUV",
    alt: "Land Defender SUV toy",
    src: "/assets/hero/live-2026/defender-suv.png",
    className: "left-[3%] top-[82.5%] z-[18] w-[38%]",
    podiumClassName:
      "h-[16%] w-[100%] bg-[linear-gradient(180deg,#e9fbf2_0%,#d7f8e5_60%,#c6f2d7_100%)]",
    labelClassName: "bg-[#17b673] min-w-[156px]",
    imageClassName: "hero-float-defender bottom-[17%] w-[88%]",
    shadowClassName: "bottom-[12%] h-[7%] w-[74%]",
    imageSizes: "(max-width: 1024px) 31vw, 17vw",
  },
  {
    key: "bike",
    label: "Royal Enfield Classic 350",
    alt: "Royal Enfield Classic 350 toy",
    src: "/assets/hero/live-2026/royal-enfield.png",
    className: "left-[60%] top-[82.8%] z-[18] w-[37%]",
    podiumClassName:
      "h-[16%] w-[100%] bg-[linear-gradient(180deg,#e8fbf5_0%,#d7f8ec_60%,#caf6e4_100%)]",
    labelClassName: "bg-[#19b98b] min-w-[194px]",
    imageClassName: "hero-float-bike bottom-[17%] w-[90%]",
    shadowClassName: "bottom-[12%] h-[7%] w-[74%]",
    imageSizes: "(max-width: 1024px) 30vw, 16vw",
  },
];

const desktopStages: StageConfig[] = [
  {
    key: "jcb",
    label: "Metal JCB",
    alt: "Metal JCB toy",
    src: "/assets/hero/live-2026/jcb.png",
    className: "left-[42.5%] top-[23.5%] z-[24] w-[20.5%]",
    podiumClassName:
      "h-[16%] w-[100%] bg-[linear-gradient(180deg,#fff8dc_0%,#ffefb5_60%,#ffe59f_100%)]",
    labelClassName: "bg-[#ffb312] min-w-[126px]",
    imageClassName: "hero-float-jcb bottom-[18%] w-[92%]",
    shadowClassName: "bottom-[12%] h-[7%] w-[72%]",
    imageSizes: "(max-width: 1280px) 16vw, 14vw",
  },
  {
    key: "drone",
    label: "Drone",
    alt: "Drone toy",
    src: "/assets/hero/live-2026/drone.png",
    className: "left-[73.5%] top-[12.5%] z-[30] w-[22.5%]",
    podiumClassName:
      "h-[16%] w-[100%] bg-[linear-gradient(180deg,#eef5ff_0%,#dbe8ff_60%,#c9d9ff_100%)]",
    labelClassName: "bg-[#2d6dff] min-w-[104px]",
    imageClassName: "hero-float-drone bottom-[18%] w-[91%]",
    shadowClassName: "bottom-[12.5%] h-[7%] w-[72%]",
    imageSizes: "(max-width: 1280px) 18vw, 16vw",
  },
  {
    key: "house",
    label: "Sweet House",
    alt: "Sweet House toy",
    src: "/assets/hero/live-2026/sweet-house.png",
    className: "left-[53.5%] top-[40%] z-[22] w-[31.5%]",
    podiumClassName:
      "h-[19%] w-[100%] bg-[linear-gradient(180deg,#fff1f7_0%,#ffdce8_58%,#ffcfe1_100%)]",
    labelClassName: "bg-[#ff4f7b] min-w-[136px]",
    imageClassName: "hero-float-house bottom-[11%] w-[94%]",
    shadowClassName: "bottom-[9%] h-[8.5%] w-[76%]",
    imageSizes: "(max-width: 1280px) 26vw, 22vw",
  },
  {
    key: "defender",
    label: "Land Defender SUV",
    alt: "Land Defender SUV toy",
    src: "/assets/hero/live-2026/defender-suv.png",
    className: "left-[29%] top-[71%] z-[18] w-[20.5%]",
    podiumClassName:
      "h-[16%] w-[100%] bg-[linear-gradient(180deg,#e9fbf2_0%,#d7f8e5_60%,#c6f2d7_100%)]",
    labelClassName: "bg-[#17b673] min-w-[178px]",
    imageClassName: "hero-float-defender bottom-[17%] w-[89%]",
    shadowClassName: "bottom-[11.5%] h-[7%] w-[72%]",
    imageSizes: "(max-width: 1280px) 18vw, 15vw",
  },
  {
    key: "bike",
    label: "Royal Enfield Classic 350",
    alt: "Royal Enfield Classic 350 toy",
    src: "/assets/hero/live-2026/royal-enfield.png",
    className: "left-[73%] top-[73.5%] z-[18] w-[21.5%]",
    podiumClassName:
      "h-[16%] w-[100%] bg-[linear-gradient(180deg,#e8fbf5_0%,#d7f8ec_60%,#caf6e4_100%)]",
    labelClassName: "bg-[#19b98b] min-w-[216px]",
    imageClassName: "hero-float-bike bottom-[16%] w-[89%]",
    shadowClassName: "bottom-[11.5%] h-[7%] w-[74%]",
    imageSizes: "(max-width: 1280px) 18vw, 15vw",
  },
];

const sparkleMap = {
  mobile: [
    { className: "left-[48%] top-[9%] text-[#ff6f98]" },
    { className: "left-[82.5%] top-[29.5%] text-[#ffca48]" },
    { className: "left-[90%] top-[41.5%] text-[#9c8cff]" },
    { className: "left-[73.5%] top-[66%] text-[#ff93b7]" },
    { className: "left-[57%] top-[82%] text-[#8669ff]" },
    { className: "left-[29%] top-[76%] text-[#ff99be]" },
    { className: "left-[46%] top-[95%] text-[#886fff]" },
  ],
  desktop: [
    { className: "left-[58.5%] top-[6.5%] text-[#ff6f98]" },
    { className: "left-[83%] top-[10%] text-[#ff92bb]" },
    { className: "left-[95.5%] top-[12.5%] text-[#ffca48]" },
    { className: "left-[77.5%] top-[30%] text-[#8d7dff]" },
    { className: "left-[97%] top-[34.5%] text-[#ff97bb]" },
    { className: "left-[54%] top-[58%] text-[#886fff]" },
    { className: "left-[40.5%] top-[65%] text-[#ffa2c0]" },
    { className: "left-[96.5%] top-[66.5%] text-[#9a87ff]" },
  ],
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
    <section className="overflow-hidden rounded-[32px] border border-white/80 bg-[linear-gradient(135deg,#fbf6ff_0%,#fff5f9_48%,#f6f0ff_100%)] shadow-[0_24px_60px_rgba(186,156,226,0.18)]">
      <div className="hidden lg:grid lg:grid-cols-[40%_60%] lg:items-center lg:gap-2 lg:px-10 lg:py-8">
        <DesktopTextBlock onExplore={handleExplore} />
        <DesktopScene />
      </div>

      <div className="relative min-h-[910px] px-5 pb-6 pt-6 lg:hidden">
        <MobileTextBlock onExplore={handleExplore} />
        <MobileScene />
      </div>
    </section>
  );
}

function MobileTextBlock({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="relative z-20 max-w-[280px]">
      <HeroBadge />

      <h1 className="mt-5 max-w-[270px] text-[clamp(34px,8.7vw,58px)] font-[800] leading-[0.96] tracking-[-0.05em] text-[#17185f]">
        <span className="block">Play Smarter.</span>
        <span className="block bg-gradient-to-r from-[#7b48ff] to-[#5b2ff4] bg-clip-text text-transparent">
          Grow Faster.
        </span>
      </h1>

      <p className="mt-4 max-w-[250px] text-[15px] leading-[1.55] text-[#67698f]">
        Carefully selected toys that boost creativity, learning, and fun.
      </p>

      <div className="mt-6">
        <Button
          onClick={onExplore}
          className="min-h-[50px] rounded-full px-6 text-[17px] font-semibold shadow-[0_16px_30px_rgba(123,72,255,0.24)]"
        >
          Explore Toys
          <span className="ml-2 text-base leading-none" aria-hidden="true">
            &rarr;
          </span>
        </Button>
      </div>
    </div>
  );
}

function DesktopTextBlock({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="relative z-20 max-w-[520px] pl-4">
      <HeroBadge />

      <h1 className="mt-8 max-w-[520px] text-[clamp(72px,7vw,96px)] font-[800] leading-[0.94] tracking-[-0.055em] text-[#17185f]">
        <span className="block">Play Smarter.</span>
        <span className="block bg-gradient-to-r from-[#7b48ff] to-[#5b2ff4] bg-clip-text text-transparent">
          Grow Faster.
        </span>
      </h1>

      <p className="mt-7 max-w-[320px] text-[19px] leading-[1.58] text-[#67698f]">
        Carefully selected toys that boost creativity, learning, and fun.
      </p>

      <div className="mt-10">
        <Button
          onClick={onExplore}
          className="min-h-[62px] rounded-full px-8 text-[18px] font-semibold shadow-[0_18px_34px_rgba(123,72,255,0.22)]"
        >
          Explore Toys
          <span className="ml-2 text-lg leading-none" aria-hidden="true">
            &rarr;
          </span>
        </Button>
      </div>
    </div>
  );
}

function MobileScene() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <MobileDecor />

      <div className="absolute inset-0">
        {mobileStages.map((stage) => (
          <ProductStage key={stage.key} stage={stage} />
        ))}
      </div>
    </div>
  );
}

function DesktopScene() {
  return (
    <div className="relative h-[680px] overflow-hidden rounded-[28px]">
      <DesktopDecor />

      <div className="absolute inset-0">
        {desktopStages.map((stage) => (
          <ProductStage key={stage.key} stage={stage} />
        ))}
      </div>
    </div>
  );
}

function ProductStage({ stage }: { stage: StageConfig }) {
  return (
    <div className={`absolute ${stage.className}`}>
      <div className="relative h-full min-h-[118px]">
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[999px] shadow-[0_18px_34px_rgba(136,116,183,0.14)] ${stage.podiumClassName}`}
        >
          <div className="absolute inset-x-[9%] top-[12%] h-[24%] rounded-full bg-white/55 blur-[2px]" />
        </div>

        <div
          className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-[rgba(118,95,177,0.12)] blur-[16px] ${stage.shadowClassName}`}
        />

        <div className={`absolute left-1/2 -translate-x-1/2 ${stage.imageClassName}`}>
          <Image
            src={stage.src}
            alt={stage.alt}
            width={640}
            height={640}
            sizes={stage.imageSizes}
            priority
            className="h-auto w-full object-contain [filter:drop-shadow(0_18px_30px_rgba(57,44,98,0.16))]"
          />
        </div>

        <div className="absolute bottom-[4.5%] left-1/2 z-20 -translate-x-1/2">
          <div
            className={`inline-flex min-h-[32px] items-center justify-center rounded-full px-3 py-2 text-center text-[12px] font-semibold leading-none text-white shadow-[0_10px_22px_rgba(104,75,183,0.18)] lg:min-h-[36px] lg:px-4 lg:text-[14px] ${stage.labelClassName}`}
          >
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <LabelIcon />
              {stage.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileDecor() {
  return (
    <>
      <div className="absolute right-[7%] top-[5%] h-[12%] w-[23%] rounded-full bg-[#eadcf3] opacity-65 blur-[2px]" />
      <Sparkles mode="mobile" />

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M71 39 C72 45, 78 45, 79 52"
          fill="none"
          stroke="#8f81ff"
          strokeWidth="0.22"
          strokeDasharray="0.9 1.2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M66 39 C60 46, 54 48, 49 53"
          fill="none"
          stroke="#ffb84f"
          strokeWidth="0.22"
          strokeDasharray="0.9 1.2"
          strokeLinecap="round"
          opacity="0.78"
        />
        <path
          d="M35 63 C42 69, 44 75, 44 79"
          fill="none"
          stroke="#ff99be"
          strokeWidth="0.22"
          strokeDasharray="0.9 1.2"
          strokeLinecap="round"
          opacity="0.82"
        />
        <path
          d="M56 72 C53 78, 51 84, 55 89"
          fill="none"
          stroke="#917dff"
          strokeWidth="0.22"
          strokeDasharray="0.9 1.2"
          strokeLinecap="round"
          opacity="0.76"
        />
        <path
          d="M77 71 C84 72, 86 77, 84 85"
          fill="none"
          stroke="#ff9fbc"
          strokeWidth="0.22"
          strokeDasharray="0.9 1.2"
          strokeLinecap="round"
          opacity="0.76"
        />
      </svg>
    </>
  );
}

function DesktopDecor() {
  return (
    <>
      <div className="absolute left-[54%] top-[2.5%] h-[18%] w-[18%] -translate-x-1/2 rounded-full bg-[#eadcf3] opacity-58 blur-[2px]" />
      <Sparkles mode="desktop" />

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M69 13 C72 18, 73 24, 71 29"
          fill="none"
          stroke="#f1c356"
          strokeWidth="0.18"
          strokeDasharray="0.7 1.1"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M79 30 C83 34, 82 39, 81 44"
          fill="none"
          stroke="#ff9ac0"
          strokeWidth="0.18"
          strokeDasharray="0.7 1.1"
          strokeLinecap="round"
          opacity="0.82"
        />
        <path
          d="M43 55 C50 53, 53 59, 52 65"
          fill="none"
          stroke="#ffb65b"
          strokeWidth="0.18"
          strokeDasharray="0.7 1.1"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M58 63 C58 74, 55 85, 64 96"
          fill="none"
          stroke="#9c8cff"
          strokeWidth="0.18"
          strokeDasharray="0.7 1.1"
          strokeLinecap="round"
          opacity="0.78"
        />
        <path
          d="M81 46 C79 58, 79 69, 81 81"
          fill="none"
          stroke="#8b7dff"
          strokeWidth="0.18"
          strokeDasharray="0.7 1.1"
          strokeLinecap="round"
          opacity="0.72"
        />
      </svg>
    </>
  );
}

function Sparkles({ mode }: { mode: "mobile" | "desktop" }) {
  return (
    <>
      {sparkleMap[mode].map((sparkle, index) => (
        <div
          key={`${mode}-${index}`}
          className={`hero-sparkle absolute ${sparkle.className}`}
          aria-hidden="true"
        >
          <SparkleIcon />
        </div>
      ))}
    </>
  );
}

function HeroBadge() {
  return (
    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/85 bg-white/94 px-[14px] py-2 text-[13px] font-semibold text-[#5b45d3] shadow-[0_12px_24px_rgba(175,145,220,0.12)] lg:px-4 lg:text-[15px]">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#efe7ff] text-[#724cff]">
        <StarIcon className="h-3 w-3" />
      </span>
      Smart Toys for Smart Kids
    </div>
  );
}

function LabelIcon() {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/18">
      <span className="h-1.5 w-1.5 rounded-full bg-white" />
    </span>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current lg:h-[18px] lg:w-[18px]">
      <path d="M12 1.5l2.14 6.36L20.5 10l-6.36 2.14L12 18.5l-2.14-6.36L3.5 10l6.36-2.14L12 1.5z" />
    </svg>
  );
}

function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current ${className}`} aria-hidden="true">
      <path d="M12 2.5l2.87 5.82 6.42.93-4.64 4.52 1.1 6.4L12 17.15l-5.75 3.02 1.1-6.4L2.71 9.25l6.42-.93L12 2.5z" />
    </svg>
  );
}
