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
  wrapperClassName: string;
  platformClassName: string;
  shadowClassName: string;
  imageClassName: string;
  labelClassName: string;
  imageSizes: string;
  floatClassName: string;
};

const mobileStages: StageConfig[] = [
  {
    key: "drone",
    label: "Drone",
    alt: "Drone toy",
    src: "/assets/hero/live-2026/drone.png",
    wrapperClassName: "right-[4%] top-[20%] z-[30] w-[30%] sm:right-[3%] sm:top-[18.5%] sm:w-[31%]",
    platformClassName:
      "h-[15%] w-[100%] bg-[linear-gradient(180deg,#f2f8ff_0%,#dff2ff_60%,#d3e9ff_100%)]",
    shadowClassName: "bottom-[10%] h-[8%] w-[68%]",
    imageClassName: "bottom-[18%] w-[86%] sm:w-[88%]",
    labelClassName: "min-w-[88px] bg-[#3E73FF]",
    imageSizes: "(max-width: 1024px) 32vw, 14vw",
    floatClassName: "hero-drift-drone",
  },
  {
    key: "house",
    label: "Sweet House",
    alt: "Sweet House toy",
    src: "/assets/hero/live-2026/sweet-house.png",
    wrapperClassName: "left-[45%] top-[42.5%] z-[22] w-[44%] -translate-x-[6%] sm:left-[44%] sm:top-[43%] sm:w-[46%]",
    platformClassName:
      "h-[18%] w-[100%] bg-[linear-gradient(180deg,#ffeef5_0%,#ffd9e8_62%,#ffcddd_100%)]",
    shadowClassName: "bottom-[9%] h-[8.5%] w-[74%]",
    imageClassName: "bottom-[13%] w-[93%] sm:w-[94%]",
    labelClassName: "min-w-[112px] bg-[#FF4F86]",
    imageSizes: "(max-width: 1024px) 46vw, 20vw",
    floatClassName: "hero-drift-house",
  },
  {
    key: "jcb",
    label: "Metal JCB",
    alt: "Metal JCB toy",
    src: "/assets/hero/live-2026/jcb.png",
    wrapperClassName: "left-[4%] top-[55%] z-[24] w-[28%] sm:left-[4%] sm:top-[53.5%] sm:w-[27%]",
    platformClassName:
      "h-[15%] w-[100%] bg-[linear-gradient(180deg,#fff9dc_0%,#fff1b8_60%,#ffe79c_100%)]",
    shadowClassName: "bottom-[10%] h-[7%] w-[68%]",
    imageClassName: "bottom-[17%] w-[88%] sm:w-[90%]",
    labelClassName: "min-w-[100px] bg-[#F2B400]",
    imageSizes: "(max-width: 1024px) 26vw, 12vw",
    floatClassName: "hero-drift-jcb",
  },
  {
    key: "defender",
    label: "Land Defender SUV",
    alt: "Land Defender SUV toy",
    src: "/assets/hero/live-2026/defender-suv.png",
    wrapperClassName: "left-[2%] bottom-[8.5%] z-[18] w-[34%] sm:left-[3%] sm:bottom-[8%] sm:w-[35%]",
    platformClassName:
      "h-[15%] w-[100%] bg-[linear-gradient(180deg,#eef9ea_0%,#ddf4db_60%,#cef0cb_100%)]",
    shadowClassName: "bottom-[10%] h-[7%] w-[70%]",
    imageClassName: "bottom-[17%] w-[87%] sm:w-[89%]",
    labelClassName: "min-w-[138px] bg-[#19B56B]",
    imageSizes: "(max-width: 1024px) 31vw, 15vw",
    floatClassName: "hero-drift-defender",
  },
  {
    key: "bike",
    label: "Royal Enfield Classic 350",
    alt: "Royal Enfield Classic 350 toy",
    src: "/assets/hero/live-2026/royal-enfield.png",
    wrapperClassName: "right-[2%] bottom-[9%] z-[18] w-[30%] sm:right-[3%] sm:bottom-[8.5%] sm:w-[31%]",
    platformClassName:
      "h-[15%] w-[100%] bg-[linear-gradient(180deg,#eefbe2_0%,#ddf7c8_60%,#d0f0b8_100%)]",
    shadowClassName: "bottom-[10%] h-[7%] w-[70%]",
    imageClassName: "bottom-[17%] w-[88%] sm:w-[90%]",
    labelClassName: "min-w-[170px] bg-[#1DBA76]",
    imageSizes: "(max-width: 1024px) 30vw, 14vw",
    floatClassName: "hero-drift-bike",
  },
];

const desktopStages: StageConfig[] = [
  {
    key: "jcb",
    label: "Metal JCB",
    alt: "Metal JCB toy",
    src: "/assets/hero/live-2026/jcb.png",
    wrapperClassName: "left-[11%] top-[26%] z-[24] w-[20%]",
    platformClassName:
      "h-[15%] w-[100%] bg-[linear-gradient(180deg,#fff9dc_0%,#fff1b8_60%,#ffe79c_100%)]",
    shadowClassName: "bottom-[10%] h-[7%] w-[68%]",
    imageClassName: "bottom-[17%] w-[90%]",
    labelClassName: "min-w-[116px] bg-[#F2B400]",
    imageSizes: "(max-width: 1400px) 15vw, 13vw",
    floatClassName: "hero-drift-jcb",
  },
  {
    key: "drone",
    label: "Drone",
    alt: "Drone toy",
    src: "/assets/hero/live-2026/drone.png",
    wrapperClassName: "right-[3%] top-[10%] z-[30] w-[22%]",
    platformClassName:
      "h-[15%] w-[100%] bg-[linear-gradient(180deg,#f2f8ff_0%,#dff2ff_60%,#d3e9ff_100%)]",
    shadowClassName: "bottom-[10%] h-[8%] w-[68%]",
    imageClassName: "bottom-[18%] w-[88%]",
    labelClassName: "min-w-[98px] bg-[#3E73FF]",
    imageSizes: "(max-width: 1400px) 17vw, 15vw",
    floatClassName: "hero-drift-drone",
  },
  {
    key: "house",
    label: "Sweet House",
    alt: "Sweet House toy",
    src: "/assets/hero/live-2026/sweet-house.png",
    wrapperClassName: "left-[36%] top-[33%] z-[22] w-[34%]",
    platformClassName:
      "h-[18%] w-[100%] bg-[linear-gradient(180deg,#ffeef5_0%,#ffd9e8_62%,#ffcddd_100%)]",
    shadowClassName: "bottom-[9%] h-[8.5%] w-[74%]",
    imageClassName: "bottom-[13%] w-[94%]",
    labelClassName: "min-w-[130px] bg-[#FF4F86]",
    imageSizes: "(max-width: 1400px) 25vw, 22vw",
    floatClassName: "hero-drift-house",
  },
  {
    key: "defender",
    label: "Land Defender SUV",
    alt: "Land Defender SUV toy",
    src: "/assets/hero/live-2026/defender-suv.png",
    wrapperClassName: "left-[2%] bottom-[8%] z-[18] w-[24%]",
    platformClassName:
      "h-[15%] w-[100%] bg-[linear-gradient(180deg,#eef9ea_0%,#ddf4db_60%,#cef0cb_100%)]",
    shadowClassName: "bottom-[10%] h-[7%] w-[70%]",
    imageClassName: "bottom-[17%] w-[89%]",
    labelClassName: "min-w-[172px] bg-[#19B56B]",
    imageSizes: "(max-width: 1400px) 20vw, 18vw",
    floatClassName: "hero-drift-defender",
  },
  {
    key: "bike",
    label: "Royal Enfield Classic 350",
    alt: "Royal Enfield Classic 350 toy",
    src: "/assets/hero/live-2026/royal-enfield.png",
    wrapperClassName: "right-[2%] bottom-[8%] z-[18] w-[23%]",
    platformClassName:
      "h-[15%] w-[100%] bg-[linear-gradient(180deg,#eefbe2_0%,#ddf7c8_60%,#d0f0b8_100%)]",
    shadowClassName: "bottom-[10%] h-[7%] w-[70%]",
    imageClassName: "bottom-[17%] w-[90%]",
    labelClassName: "min-w-[210px] bg-[#1DBA76]",
    imageSizes: "(max-width: 1400px) 19vw, 17vw",
    floatClassName: "hero-drift-bike",
  },
];

const mobileSparkles = [
  "left-[63%] top-[15%] text-[#f58cab]",
  "right-[6%] top-[34%] text-[#f7b739]",
  "left-[31%] top-[73%] text-[#8b78ff]",
  "right-[11%] top-[74%] text-[#ffa2bf]",
];

const desktopSparkles = [
  "left-[41%] top-[11%] text-[#f58cab]",
  "right-[11%] top-[14%] text-[#f7b739]",
  "left-[58%] top-[58%] text-[#8b78ff]",
  "right-[20%] top-[63%] text-[#ffa2bf]",
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
    <section className="overflow-hidden rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,#F8F3FF_0%,#F7F5FF_48%,#EEF6FF_100%)] shadow-[0_24px_60px_rgba(186,156,226,0.18)]">
      <div className="relative lg:hidden">
        <div className="relative min-h-[820px] px-[18px] pb-5 pt-[18px] sm:min-h-[850px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_10%,rgba(225,211,255,0.75),transparent_18%),radial-gradient(circle_at_66%_55%,rgba(255,220,236,0.72),transparent_20%),radial-gradient(circle_at_18%_85%,rgba(216,244,222,0.72),transparent_18%)]" />
          <MobileConnectorLines />
          <Sparkles mode="mobile" />

          <div className="relative z-20 max-w-[270px] sm:max-w-[284px]">
            <HeroBadge />

            <h1 className="mt-4 max-w-[272px] text-[clamp(32px,8.3vw,54px)] font-[800] leading-[0.96] tracking-[-0.05em] text-[#1D2240] sm:max-w-[284px]">
              <span className="block">Play Smarter.</span>
              <span className="block bg-gradient-to-r from-[#6F5BFF] to-[#D86BC8] bg-clip-text text-transparent">
                Grow Faster.
              </span>
            </h1>

            <p className="mt-4 max-w-[244px] text-[15px] leading-[1.62] text-[#5B6285] sm:max-w-[258px]">
              Carefully selected toys that boost creativity, learning, and fun in a home-like
              environment.
            </p>

            <div className="mt-5">
              <Button
                onClick={handleExplore}
                className="min-h-[48px] rounded-full bg-[linear-gradient(90deg,#FF6E7A_0%,#7C5CFF_100%)] px-5 text-[15px] font-semibold text-white shadow-[0_16px_28px_rgba(111,91,255,0.22)] sm:min-h-[50px] sm:px-6 sm:text-[16px]"
              >
                Explore Toys
              </Button>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0">
            {mobileStages.map((stage) => (
              <ProductStage key={stage.key} stage={stage} />
            ))}
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="relative grid min-h-[690px] grid-cols-[44%_56%] gap-4 px-8 py-8 xl:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_64%_12%,rgba(225,211,255,0.72),transparent_16%),radial-gradient(circle_at_62%_56%,rgba(255,220,236,0.68),transparent_18%),radial-gradient(circle_at_80%_80%,rgba(216,244,222,0.68),transparent_18%)]" />
          <DesktopConnectorLines />
          <Sparkles mode="desktop" />

          <div className="relative z-20 flex items-center pl-4 xl:pl-6">
            <div className="max-w-[540px]">
              <HeroBadge />

              <h1 className="mt-7 max-w-[520px] text-[clamp(70px,7vw,94px)] font-[800] leading-[0.93] tracking-[-0.055em] text-[#1D2240]">
                <span className="block">Play Smarter.</span>
                <span className="block bg-gradient-to-r from-[#6F5BFF] to-[#D86BC8] bg-clip-text text-transparent">
                  Grow Faster.
                </span>
              </h1>

              <p className="mt-6 max-w-[360px] text-[18px] leading-[1.65] text-[#5B6285]">
                Carefully selected toys that boost creativity, learning, and fun in a home-like
                environment.
              </p>

              <div className="mt-8">
                <Button
                  onClick={handleExplore}
                  className="min-h-[58px] rounded-full bg-[linear-gradient(90deg,#FF6E7A_0%,#7C5CFF_100%)] px-8 text-[17px] font-semibold text-white shadow-[0_18px_30px_rgba(111,91,255,0.2)]"
                >
                  Explore Toys
                </Button>
              </div>
            </div>
          </div>

          <div className="relative z-20 min-h-[640px]">
            {desktopStages.map((stage) => (
              <ProductStage key={stage.key} stage={stage} />
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes heroDrift {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes heroDriftDrone {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(-1deg);
          }
        }

        @keyframes heroSparkle {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.06);
          }
        }

        .hero-drift-house,
        .hero-drift-jcb,
        .hero-drift-defender,
        .hero-drift-bike {
          animation: heroDrift 7.2s ease-in-out infinite;
          will-change: transform;
        }

        .hero-drift-drone {
          animation: heroDriftDrone 6.2s ease-in-out infinite;
          will-change: transform;
        }

        .hero-sparkle {
          animation: heroSparkle 4.6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-drift-house,
          .hero-drift-jcb,
          .hero-drift-defender,
          .hero-drift-bike,
          .hero-drift-drone,
          .hero-sparkle {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

function ProductStage({ stage }: { stage: StageConfig }) {
  return (
    <div className={`absolute ${stage.wrapperClassName}`}>
      <div className="relative min-h-[122px]">
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[999px] shadow-[0_18px_30px_rgba(63,72,119,0.1)] ${stage.platformClassName}`}
        >
          <div className="absolute inset-x-[10%] top-[12%] h-[22%] rounded-full bg-white/50 blur-[2px]" />
        </div>

        <div
          className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-[rgba(30,50,90,0.12)] blur-[15px] ${stage.shadowClassName}`}
        />

        <div
          className={`absolute left-1/2 z-20 -translate-x-1/2 ${stage.imageClassName} ${stage.floatClassName}`}
        >
          <Image
            src={stage.src}
            alt={stage.alt}
            width={640}
            height={640}
            priority
            sizes={stage.imageSizes}
            className="h-auto w-full object-contain [filter:drop-shadow(0_16px_28px_rgba(63,72,119,0.12))]"
          />
        </div>

        <div className="absolute bottom-[4%] left-1/2 z-30 -translate-x-1/2">
          <div
            className={`inline-flex min-h-[30px] items-center justify-center rounded-full px-2.5 py-1.5 text-center text-[11px] font-semibold leading-none text-white shadow-[0_10px_20px_rgba(80,40,120,0.16)] sm:min-h-[32px] sm:px-3 sm:py-2 sm:text-[12px] lg:min-h-[36px] lg:px-4 lg:text-[14px] ${stage.labelClassName}`}
          >
            {stage.label}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroBadge() {
  return (
    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/80 bg-[#EEF0FF]/92 px-[14px] py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4B5CDB] shadow-[0_12px_24px_rgba(175,145,220,0.1)] sm:text-[12px]">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/75 text-[#6F5BFF]">
        <StarIcon className="h-3 w-3" />
      </span>
      Smart Toys for Smart Kids
    </div>
  );
}

function Sparkles({ mode }: { mode: "mobile" | "desktop" }) {
  const sparkles = mode === "mobile" ? mobileSparkles : desktopSparkles;

  return (
    <>
      {sparkles.map((className, index) => (
        <div key={`${mode}-${index}`} className={`hero-sparkle absolute ${className}`} aria-hidden="true">
          <SparkleIcon />
        </div>
      ))}
    </>
  );
}

function MobileConnectorLines() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M69 35 C63 43, 56 47, 48 53"
        fill="none"
        stroke="#F5A3B7"
        strokeWidth="0.24"
        strokeDasharray="0.9 1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M48 71 C43 78, 49 84, 59 86"
        fill="none"
        stroke="#B7BDF8"
        strokeWidth="0.24"
        strokeDasharray="0.9 1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

function DesktopConnectorLines() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M69 18 C74 23, 73 30, 70 38"
        fill="none"
        stroke="#F5A3B7"
        strokeWidth="0.18"
        strokeDasharray="0.8 1.15"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M49 58 C45 67, 49 79, 60 87"
        fill="none"
        stroke="#B7BDF8"
        strokeWidth="0.18"
        strokeDasharray="0.8 1.15"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
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
