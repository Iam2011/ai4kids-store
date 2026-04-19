"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackStoreEvent } from "@/lib/analytics/track";

type HeroAssetConfig = {
  key: "drone" | "house" | "defender" | "bike";
  src: string;
  alt: string;
  groupStyle: React.CSSProperties;
  imageStyle: React.CSSProperties;
  saleStyle: React.CSSProperties;
  saleClassName?: string;
  sizes: string;
  visualOnly?: boolean;
};

const heroAssets: HeroAssetConfig[] = [
  {
    key: "drone",
    src: "/assets/hero/live-2026/drone.png",
    alt: "Drone toy",
    groupStyle: { left: 254, top: 0, width: 161.7, height: 117.43 },
    imageStyle: { left: 1.35, top: 32.21, width: 159, height: 83 },
    saleStyle: { left: 64.8, top: 9.75, width: 73, height: 26 },
    saleClassName: "-rotate-[13deg]",
    sizes: "159px",
  },
  {
    key: "house",
    src: "/assets/hero/live-2026/sweet-house.png",
    alt: "Sweet House toy",
    groupStyle: { left: 145, top: 146, width: 291, height: 262 },
    imageStyle: { left: 0.82, top: 0.78, width: 289.35, height: 260.45 },
    saleStyle: { left: 117.87, top: 137.2, width: 50.29, height: 10.62 },
    saleClassName: "rotate-[4deg]",
    sizes: "289px",
    visualOnly: true,
  },
  {
    key: "defender",
    src: "/assets/hero/live-2026/defender-suv.png",
    alt: "Land Defender SUV toy",
    groupStyle: { left: 0, top: 323, width: 248.6, height: 161.7 },
    imageStyle: { left: 4.3, top: 5.85, width: 240, height: 150 },
    saleStyle: { left: 66.13, top: 90.04, width: 50, height: 13 },
    saleClassName: "-rotate-[14deg]",
    sizes: "240px",
  },
  {
    key: "bike",
    src: "/assets/hero/live-2026/royal-enfield.png",
    alt: "Royal Enfield Classic 350 toy",
    groupStyle: { left: 250, top: 358, width: 175.1, height: 109.14 },
    imageStyle: { left: 0.05, top: 0.07, width: 175, height: 109 },
    saleStyle: { left: 95.04, top: 40.15, width: 51, height: 13 },
    saleClassName: "-rotate-[6deg]",
    sizes: "175px",
  },
];

export function HeroBanner({
  heroLinks,
}: {
  heroLinks?: {
    drone?: string;
    defender?: string;
    bike?: string;
  };
}) {
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
    <section className="relative mx-auto h-[610px] w-full max-w-[390px] overflow-hidden bg-white">
      <div className="absolute left-[-38px] top-0 h-[610px] w-[436px]">
        <Image
          src="/assets/hero/live-2026/hero-background.png"
          alt=""
          fill
          priority
          sizes="390px"
          className="object-cover"
        />

        <div className="absolute left-[55px] top-[15px] z-20 h-[267px] w-[291px]">
          <div className="absolute left-0 top-0 h-[34px] w-[240px]">
            <div className="absolute left-[3px] top-0 h-[34px] w-[237px] rounded-full bg-white/59 shadow-[0_2px_8px_rgba(0,0,0,0.15)]" />
            <div className="absolute left-[16px] top-0 flex h-[34px] items-center gap-2 text-[14px] font-bold text-[#1a1a1a]">
              <span className="flex h-[14px] w-[14px] items-center justify-center text-[#ffca1b]">
                <StarIcon />
              </span>
              <span>Smart Toys for Smart Kids</span>
            </div>
          </div>

          <div className="absolute left-[3px] top-[42px] h-[173px] w-[288px]">
            <h1 className="absolute left-0 top-0 w-[278px] text-left text-[36px] font-bold leading-[1.2] tracking-[0] text-[#1a1a1a]">
              Play Smarter.
            </h1>
            <h1 className="absolute left-0 top-[42px] w-[288px] text-left text-[36px] font-bold leading-[1.1] tracking-[0] text-[#6b46ff]">
              Grow Faster.
            </h1>
            <p className="absolute left-0 top-[82px] w-[194px] text-left text-[17px] leading-[1.4] text-[#666666]">
              Carefully selected toys that boost creativity, learning, and fun.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExplore}
            className="absolute left-[3px] top-[229px] flex h-[38px] w-[117px] items-center justify-center rounded-full bg-[linear-gradient(180deg,#3200fc_4%,#ff0065_98%)] text-center text-[16px] font-extrabold uppercase tracking-[0.8px] text-black"
          >
            SHOP NOW
          </button>
        </div>

        <div className="absolute left-0 top-[106px] z-10 h-[484.7px] w-[436px]">
          {heroAssets.map((asset) => {
            const href =
              asset.key === "drone"
                ? heroLinks?.drone
                : asset.key === "defender"
                  ? heroLinks?.defender
                  : asset.key === "bike"
                    ? heroLinks?.bike
                    : undefined;

            const content = (
              <div className="relative h-full w-full">
                <div
                  className="absolute"
                  style={{
                    left: asset.imageStyle.left,
                    top: asset.imageStyle.top,
                    width: asset.imageStyle.width,
                    height: asset.imageStyle.height,
                  }}
                >
                  <Image
                    src={asset.src}
                    alt={asset.alt}
                    width={Math.round(Number(asset.imageStyle.width))}
                    height={Math.round(Number(asset.imageStyle.height))}
                    priority
                    sizes={asset.sizes}
                    className="h-auto w-full object-contain"
                  />
                </div>

                <div
                  className={`absolute flex items-center justify-center text-center font-bold uppercase leading-[1.1] text-[#feff00] [text-shadow:-1px_-1px_2px_rgba(227,69,69,1)] ${asset.saleClassName || ""}`}
                  style={{
                    left: asset.saleStyle.left,
                    top: asset.saleStyle.top,
                    width: asset.saleStyle.width,
                    height: asset.saleStyle.height,
                    fontSize:
                      asset.key === "drone"
                        ? 14
                        : asset.key === "house"
                          ? 10
                          : asset.key === "bike"
                            ? 10
                            : 10,
                  }}
                >
                  FOR SALE
                </div>
              </div>
            );

            return (
              <div
                key={asset.key}
                className="absolute"
                style={{
                  left: asset.groupStyle.left,
                  top: asset.groupStyle.top,
                  width: asset.groupStyle.width,
                  height: asset.groupStyle.height,
                }}
              >
                {href && !asset.visualOnly ? (
                  <Link
                    href={`/products/${href}`}
                    aria-label={asset.alt}
                    className="pointer-events-auto block h-full w-full"
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[14px] w-[14px] fill-current" aria-hidden="true">
      <path d="M12 2.5l2.87 5.82 6.42.93-4.64 4.52 1.1 6.4L12 17.15l-5.75 3.02 1.1-6.4L2.71 9.25l6.42-.93L12 2.5z" />
    </svg>
  );
}
