"use client";

import type { ComponentType } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/button";
import { trackStoreEvent } from "@/lib/analytics/track";

type CtaDestination = "/products" | "/products?featured=true";

type HeroProduct = {
  src: string;
  alt: string;
  label: string;
  accent: string;
  pedestal: string;
  halo: string;
};

const heroProducts: Record<string, HeroProduct> = {
  drone: {
    src: "/assets/hero/live-2026/drone.png",
    alt: "Drone toy",
    label: "Drone",
    accent: "from-[#5d9cff] to-[#2d6dff]",
    pedestal: "from-[#e6f0ff] to-[#cfe0ff]",
    halo: "bg-[radial-gradient(circle,rgba(93,156,255,0.24),rgba(255,255,255,0)_72%)]",
  },
  house: {
    src: "/assets/hero/live-2026/sweet-house.png",
    alt: "Sweet House toy",
    label: "Sweet House",
    accent: "from-[#ff5b8a] to-[#ff4f7b]",
    pedestal: "from-[#ffe7f0] to-[#f9d9e8]",
    halo: "bg-[radial-gradient(circle,rgba(255,116,155,0.18),rgba(196,183,255,0.14)_45%,rgba(255,255,255,0)_74%)]",
  },
  jcb: {
    src: "/assets/hero/live-2026/jcb.png",
    alt: "Metal JCB toy",
    label: "Metal JCB",
    accent: "from-[#ffcf3b] to-[#ffa800]",
    pedestal: "from-[#fff5ce] to-[#ffe9aa]",
    halo: "bg-[radial-gradient(circle,rgba(255,208,67,0.24),rgba(255,255,255,0)_72%)]",
  },
  defender: {
    src: "/assets/hero/live-2026/defender-suv.png",
    alt: "Land Defender SUV toy",
    label: "Land Defender SUV",
    accent: "from-[#27c689] to-[#17b673]",
    pedestal: "from-[#ddf9e8] to-[#c7f2d7]",
    halo: "bg-[radial-gradient(circle,rgba(39,198,137,0.18),rgba(255,255,255,0)_72%)]",
  },
  bike: {
    src: "/assets/hero/live-2026/royal-enfield.png",
    alt: "Royal Enfield Classic 350 toy",
    label: "Royal Enfield Classic 350",
    accent: "from-[#25c8a8] to-[#19b98b]",
    pedestal: "from-[#ddfaef] to-[#caf6e4]",
    halo: "bg-[radial-gradient(circle,rgba(37,200,168,0.18),rgba(255,255,255,0)_72%)]",
  },
};

const assuranceItems = [
  {
    title: "Safe & Durable",
    subtitle: "Tested for safety",
    color: "text-[#7d58ff]",
    bg: "bg-[#f3ecff]",
    icon: ShieldIcon,
  },
  {
    title: "COD Available",
    subtitle: "Pay at your door",
    color: "text-[#25c583]",
    bg: "bg-[#e8fbf1]",
    icon: TruckIcon,
  },
  {
    title: "Loved by Parents",
    subtitle: "10,000+ happy parents",
    color: "text-[#ff5b92]",
    bg: "bg-[#ffeaf2]",
    icon: HeartIcon,
  },
];

const benefitItems = [
  {
    title: "Free Shipping",
    subtitle: "On orders above Rs 499",
    color: "text-[#8a62ff]",
    bg: "bg-[#f3ecff]",
    icon: TruckIcon,
  },
  {
    title: "Secure Payments",
    subtitle: "100% secure checkout",
    color: "text-[#4d8cff]",
    bg: "bg-[#ebf3ff]",
    icon: ShieldIcon,
  },
  {
    title: "Easy Returns",
    subtitle: "Hassle free returns",
    color: "text-[#f4ad1d]",
    bg: "bg-[#fff5df]",
    icon: ReturnIcon,
  },
  {
    title: "24/7 Support",
    subtitle: "We're here to help",
    color: "text-[#3cc29c]",
    bg: "bg-[#e9fbf5]",
    icon: SupportIcon,
  },
];

const avatarGradients = [
  "from-[#ffbca5] to-[#ff7d73]",
  "from-[#ffd9a8] to-[#ffa850]",
  "from-[#8fd7ff] to-[#5f9cff]",
  "from-[#9df0d6] to-[#35c68b]",
];

export function HeroBanner() {
  const router = useRouter();

  const handleCtaClick = async (label: string, href: CtaDestination) => {
    await trackStoreEvent({
      eventType: "hero_click",
      category: {
        categoryLabel: label,
      },
    }).catch(() => {});

    router.push(href);
  };

  return (
    <section className="overflow-hidden rounded-[34px] border border-white/80 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(255,245,250,0.92)_48%,rgba(247,239,255,0.96))] shadow-[0_28px_70px_rgba(190,161,229,0.26)]">
      <div className="relative overflow-hidden rounded-[34px] border border-white/70 px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
        <HeroBackdrop />

        <div className="relative z-10 hidden lg:grid lg:grid-cols-[minmax(320px,430px)_1fr] lg:gap-8 lg:items-start">
          <div className="flex min-h-[565px] flex-col justify-between pt-4">
            <div>
              <TagPill />
              <h1 className="mt-6 text-[70px] font-black leading-[0.96] tracking-[-0.05em] text-[#1d1b62]">
                <span className="block">Play Smarter.</span>
                <span className="block bg-gradient-to-r from-[#7a48ff] to-[#5b2ff4] bg-clip-text text-transparent">
                  Grow Faster.
                </span>
              </h1>
              <p className="mt-6 max-w-[360px] text-[18px] leading-9 text-[#6b6a95]">
                Carefully selected toys that boost creativity, learning, and fun.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Button
                  onClick={() => handleCtaClick("Explore Toys", "/products")}
                  className="min-h-[56px] min-w-[188px] rounded-[999px] px-8 text-lg shadow-[0_18px_36px_rgba(123,72,255,0.28)]"
                >
                  Explore Toys
                  <span className="ml-3 text-xl leading-none" aria-hidden="true">
                    &rarr;
                  </span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleCtaClick("Shop Bestsellers", "/products?featured=true")}
                  className="min-h-[56px] min-w-[208px] rounded-[999px] border-[#8b63ff] px-8 text-lg text-[#5b38d6] shadow-[0_16px_30px_rgba(123,72,255,0.08)]"
                >
                  Shop Bestsellers
                </Button>
              </div>

              <div className="mt-10 flex gap-5">
                {assuranceItems.map((item) => (
                  <AssurancePill key={item.title} {...item} />
                ))}
              </div>
            </div>

            <div className="w-full max-w-[430px] rounded-[24px] border border-[#eadff8] bg-white/88 px-5 py-4 shadow-[0_18px_34px_rgba(172,139,219,0.12)] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {avatarGradients.map((gradient, index) => (
                    <div
                      key={gradient}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br ${gradient} text-sm font-black text-white shadow-[0_8px_18px_rgba(117,88,189,0.16)]`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="text-[20px] font-extrabold text-[#3e3973]">
                    Trusted by 10,000+ Families
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-[15px] text-[#6d6993]">
                    <span className="flex items-center gap-1.5 text-[#ffb400]">
                      <StarRow />
                    </span>
                    <span>4.8/5 (2,500+ Reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DesktopScene />
        </div>

        <div className="relative z-10 lg:hidden">
          <TagPill />
          <div className="mt-5 flex flex-col gap-6">
            <div className="max-w-[240px]">
              <h1 className="text-[53px] font-black leading-[0.96] tracking-[-0.05em] text-[#1d1b62] sm:text-[58px]">
                <span className="block">Play Smarter.</span>
                <span className="block bg-gradient-to-r from-[#7a48ff] to-[#5b2ff4] bg-clip-text text-transparent">
                  Grow Faster.
                </span>
              </h1>
              <p className="mt-4 max-w-[210px] text-[17px] leading-8 text-[#6b6a95] sm:max-w-[250px]">
                Carefully selected toys that boost creativity, learning, and fun.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Button
                  onClick={() => handleCtaClick("Explore Toys", "/products")}
                  className="min-h-[44px] w-fit min-w-[146px] rounded-[999px] px-5 py-2 text-[14px] shadow-[0_16px_34px_rgba(123,72,255,0.26)]"
                >
                  Explore Toys
                  <span className="ml-2 text-base leading-none" aria-hidden="true">
                    &rarr;
                  </span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleCtaClick("Shop Bestsellers", "/products?featured=true")}
                  className="min-h-[42px] w-fit min-w-[148px] rounded-[999px] border-[#8b63ff] px-5 py-2 text-[14px] text-[#5b38d6] shadow-[0_12px_24px_rgba(123,72,255,0.08)]"
                >
                  Shop Bestsellers
                </Button>
              </div>
            </div>

            <MobileScene />

            <div className="grid grid-cols-3 gap-3">
              {assuranceItems.map((item) => (
                <AssurancePill key={item.title} compact {...item} />
              ))}
            </div>

            <div className="rounded-[22px] border border-[#eadff8] bg-white/88 px-4 py-4 shadow-[0_18px_34px_rgba(172,139,219,0.12)] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {avatarGradients.map((gradient, index) => (
                    <div
                      key={gradient}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br ${gradient} text-xs font-black text-white shadow-[0_8px_18px_rgba(117,88,189,0.16)]`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="text-[17px] font-extrabold leading-6 text-[#3e3973]">
                    Trusted by 10,000+ Families
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-[#6d6993]">
                    <span className="flex items-center gap-1 text-[#ffb400]">
                      <StarRow compact />
                    </span>
                    <span>4.8/5 (2,500+ Reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid border-t border-white/60 bg-white/82 lg:grid-cols-4">
        {benefitItems.map((item, index) => (
          <BenefitCard key={item.title} index={index} {...item} />
        ))}
      </div>
    </section>
  );
}

function DesktopScene() {
  return (
    <div className="relative h-[610px] overflow-hidden rounded-[36px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.78),rgba(255,255,255,0)_24%),radial-gradient(circle_at_20%_16%,rgba(248,222,122,0.16),rgba(255,255,255,0)_18%),radial-gradient(circle_at_83%_14%,rgba(101,145,255,0.14),rgba(255,255,255,0)_19%),radial-gradient(circle_at_24%_84%,rgba(91,228,167,0.14),rgba(255,255,255,0)_18%),radial-gradient(circle_at_78%_85%,rgba(74,213,176,0.12),rgba(255,255,255,0)_18%)]" />
      <div className="absolute left-[33%] top-[11%] h-[360px] w-[360px] rounded-full bg-[#efe5ff] opacity-70 blur-[14px]" />
      <div className="absolute right-[10%] top-[6%] h-[180px] w-[180px] rounded-full bg-[#dfeaff] opacity-85 blur-[10px]" />
      <div className="absolute left-[11%] top-[12%] h-[160px] w-[160px] rounded-full bg-[#fff0cf] opacity-90 blur-[12px]" />
      <div className="absolute left-[8%] bottom-[10%] h-[170px] w-[170px] rounded-full bg-[#d9f8e3] opacity-90 blur-[12px]" />
      <div className="absolute right-[6%] bottom-[10%] h-[165px] w-[165px] rounded-full bg-[#def9ec] opacity-85 blur-[12px]" />

      <ScenePaths className="absolute inset-0" />
      <Sparkles className="absolute inset-0" />

      <ProductPedestal
        className="absolute left-[7%] top-[10%] z-20 w-[26%]"
        imageClassName="w-[94%]"
        product={heroProducts.jcb}
        pedestalSize="h-[76px] w-[204px]"
        pedestalOffset="bottom-[8px]"
        labelWidth="w-[126px]"
        labelOffset="-bottom-2"
      />

      <ProductPedestal
        className="absolute right-[4%] top-[6%] z-30 w-[29%]"
        imageClassName="w-[98%]"
        product={heroProducts.drone}
        pedestalSize="h-[78px] w-[214px]"
        pedestalOffset="bottom-[10px]"
        labelWidth="w-[112px]"
        labelOffset="-bottom-1"
      />

      <ProductPedestal
        className="absolute left-1/2 top-[12%] z-20 w-[44%] -translate-x-1/2"
        imageClassName="w-[94%]"
        product={heroProducts.house}
        pedestalSize="h-[112px] w-[308px]"
        pedestalOffset="bottom-[12px]"
        labelWidth="w-[150px]"
        labelOffset="-bottom-4"
        large
      />

      <ProductPedestal
        className="absolute left-[5%] bottom-[4%] z-20 w-[29%]"
        imageClassName="w-[100%]"
        product={heroProducts.defender}
        pedestalSize="h-[78px] w-[226px]"
        pedestalOffset="bottom-[8px]"
        labelWidth="w-[176px]"
        labelOffset="-bottom-2"
      />

      <ProductPedestal
        className="absolute right-[4%] bottom-[6%] z-20 w-[30%]"
        imageClassName="w-[100%]"
        product={heroProducts.bike}
        pedestalSize="h-[78px] w-[224px]"
        pedestalOffset="bottom-[8px]"
        labelWidth="w-[204px]"
        labelOffset="-bottom-2"
      />
    </div>
  );
}

function MobileScene() {
  return (
    <div className="relative h-[575px] overflow-hidden rounded-[30px] sm:h-[620px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(255,255,255,0.78),rgba(255,255,255,0)_24%),radial-gradient(circle_at_82%_10%,rgba(93,156,255,0.12),rgba(255,255,255,0)_20%),radial-gradient(circle_at_16%_52%,rgba(255,208,67,0.14),rgba(255,255,255,0)_18%),radial-gradient(circle_at_22%_86%,rgba(39,198,137,0.14),rgba(255,255,255,0)_18%),radial-gradient(circle_at_78%_86%,rgba(37,200,168,0.12),rgba(255,255,255,0)_18%)]" />
      <div className="absolute left-1/2 top-[18%] h-[220px] w-[220px] -translate-x-1/2 rounded-full bg-[#efe5ff] opacity-75 blur-[12px]" />
      <div className="absolute right-[10%] top-[4%] h-[110px] w-[110px] rounded-full bg-[#dfeaff] opacity-85 blur-[8px]" />

      <ScenePaths className="absolute inset-0 opacity-90" />
      <Sparkles className="absolute inset-0" />

      <ProductPedestal
        className="absolute right-[2%] top-[3%] z-30 w-[43%]"
        imageClassName="w-[96%]"
        product={heroProducts.drone}
        pedestalSize="h-[52px] w-[145px]"
        pedestalOffset="bottom-[6px]"
        labelWidth="w-[92px]"
        labelOffset="-bottom-1"
        mobile
      />

      <ProductPedestal
        className="absolute left-1/2 top-[17%] z-20 w-[58%] -translate-x-1/2"
        imageClassName="w-[94%]"
        product={heroProducts.house}
        pedestalSize="h-[76px] w-[214px]"
        pedestalOffset="bottom-[8px]"
        labelWidth="w-[128px]"
        labelOffset="-bottom-3"
        large
        mobile
      />

      <ProductPedestal
        className="absolute left-[2%] top-[40%] z-20 w-[35%]"
        imageClassName="w-[96%]"
        product={heroProducts.jcb}
        pedestalSize="h-[50px] w-[132px]"
        pedestalOffset="bottom-[6px]"
        labelWidth="w-[98px]"
        labelOffset="-bottom-1"
        mobile
      />

      <ProductPedestal
        className="absolute left-[1%] bottom-[3%] z-20 w-[43%]"
        imageClassName="w-[98%]"
        product={heroProducts.defender}
        pedestalSize="h-[54px] w-[156px]"
        pedestalOffset="bottom-[6px]"
        labelWidth="w-[138px]"
        labelOffset="-bottom-1"
        mobile
      />

      <ProductPedestal
        className="absolute right-[1%] bottom-[4%] z-20 w-[44%]"
        imageClassName="w-[98%]"
        product={heroProducts.bike}
        pedestalSize="h-[54px] w-[158px]"
        pedestalOffset="bottom-[6px]"
        labelWidth="w-[152px]"
        labelOffset="-bottom-1"
        mobile
      />
    </div>
  );
}

function ProductPedestal({
  className,
  product,
  pedestalSize,
  pedestalOffset,
  imageClassName,
  labelWidth,
  labelOffset,
  large = false,
  mobile = false,
}: {
  className: string;
  product: HeroProduct;
  pedestalSize: string;
  pedestalOffset: string;
  imageClassName: string;
  labelWidth: string;
  labelOffset: string;
  large?: boolean;
  mobile?: boolean;
}) {
  return (
    <div className={className}>
      <div className="relative flex justify-center">
        <div
          className={`absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[8px] ${product.halo}`}
        />

        <div
          className={`absolute left-1/2 -translate-x-1/2 rounded-[999px] bg-gradient-to-b ${product.pedestal} shadow-[0_30px_50px_rgba(172,143,224,0.2)] ${pedestalSize} ${pedestalOffset}`}
        >
          <div className="absolute inset-x-[10%] top-3 h-[18%] rounded-full bg-white/70 blur-[2px]" />
        </div>

        <div className="absolute left-1/2 top-[74%] h-7 w-[62%] -translate-x-1/2 rounded-full bg-[rgba(74,59,130,0.16)] blur-[14px]" />

        <Image
          src={product.src}
          alt={product.alt}
          width={large ? 420 : 290}
          height={large ? 420 : 290}
          sizes={mobile ? "(max-width: 768px) 45vw" : "(max-width: 1200px) 22vw, 320px"}
          priority
          className={`relative z-10 h-auto drop-shadow-[0_18px_32px_rgba(92,72,150,0.18)] ${imageClassName}`}
        />

        <div
          className={`absolute left-1/2 z-20 -translate-x-1/2 rounded-[999px] bg-gradient-to-r ${product.accent} px-4 py-2 text-center text-white shadow-[0_12px_24px_rgba(104,75,183,0.28)] ${labelWidth} ${labelOffset}`}
        >
          <span
            className={`flex items-center justify-center gap-1.5 font-semibold ${mobile ? "text-[11px]" : "text-sm"}`}
          >
            <LabelDot />
            {product.label}
          </span>
        </div>
      </div>
    </div>
  );
}

function AssurancePill({
  title,
  subtitle,
  icon: Icon,
  color,
  bg,
  compact = false,
}: {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 ${
        compact
          ? "min-w-0 flex-col rounded-[20px] border border-white/70 bg-white/72 p-3 text-center shadow-[0_14px_24px_rgba(175,145,220,0.12)]"
          : ""
      }`}
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className={compact ? "w-full" : ""}>
        <p className={`${compact ? "text-[13px]" : "text-sm"} font-extrabold leading-5 text-[#4b4676]`}>
          {title}
        </p>
        <p className={`mt-1 ${compact ? "text-[11px] leading-4" : "text-xs leading-5"} text-[#8d84a8]`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function BenefitCard({
  title,
  subtitle,
  icon: Icon,
  color,
  bg,
  index,
}: {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  index: number;
}) {
  return (
    <div
      className={`flex items-center gap-4 px-4 py-5 sm:px-5 lg:px-7 ${
        index > 0 ? "border-t border-[#f0e8fb] lg:border-l lg:border-t-0" : ""
      }`}
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[15px] font-extrabold text-[#454070]">{title}</p>
        <p className="mt-1 text-[13px] leading-5 text-[#8f87aa]">{subtitle}</p>
      </div>
    </div>
  );
}

function TagPill() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/92 px-4 py-2 text-sm font-bold text-[#5b45d3] shadow-[0_14px_26px_rgba(175,145,220,0.12)]">
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.95),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(255,243,224,0.58),transparent_26%),radial-gradient(circle_at_80%_68%,rgba(241,233,255,0.75),transparent_34%),linear-gradient(135deg,rgba(248,241,255,0.96),rgba(255,247,250,0.92)_45%,rgba(246,239,255,0.95))]" />
      <div className="pointer-events-none absolute left-[34%] top-[8%] h-44 w-44 rounded-full bg-[#efe6ff] opacity-70 blur-[2px]" />
      <div className="pointer-events-none absolute right-[14%] top-[18%] h-36 w-36 rounded-full bg-[#fff2dd] opacity-90 blur-[2px]" />
      <div className="pointer-events-none absolute bottom-[16%] left-[56%] h-48 w-48 rounded-full bg-[#f0ebff] opacity-80 blur-[2px]" />
    </>
  );
}

function ScenePaths({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1000 700" aria-hidden="true" className={className}>
      <path
        d="M640 98c48 9 97 44 103 84 5 34-29 52-21 88 8 34 51 42 69 71 32 53-5 139-87 187-57 34-135 55-195 41-85-20-126-107-86-176 27-46 88-54 111-97 22-42-8-98 28-145 18-23 47-38 78-41z"
        fill="none"
        stroke="rgba(244,193,96,0.55)"
        strokeWidth="3"
        strokeDasharray="8 14"
        strokeLinecap="round"
      />
      <path
        d="M349 528c89-56 171-77 245-50 63 24 90 82 180 88"
        fill="none"
        stroke="rgba(146,110,255,0.38)"
        strokeWidth="3"
        strokeDasharray="5 14"
        strokeLinecap="round"
      />
      <path
        d="M139 470c47-87 118-124 212-110 49 7 77 37 127 23"
        fill="none"
        stroke="rgba(255,149,183,0.42)"
        strokeWidth="3"
        strokeDasharray="6 14"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Sparkles({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <Sparkle className="absolute left-[39%] top-[16%] text-[#a490ff]" />
      <Sparkle className="absolute right-[6%] top-[17%] text-[#9c90ff]" />
      <Sparkle className="absolute right-[2%] top-[46%] text-[#ffa3c7]" />
      <Sparkle className="absolute left-[48%] top-[58%] text-[#c0a8ff]" />
      <Sparkle className="absolute left-[22%] top-[73%] text-[#ff9bbd]" />
      <Sparkle className="absolute right-[28%] bottom-[15%] text-[#af96ff]" />

      <div className="absolute left-[34%] top-[18%] grid grid-cols-4 gap-2 opacity-70">
        {Array.from({ length: 12 }).map((_, index) => (
          <span key={index} className="h-1.5 w-1.5 rounded-full bg-[#9e8bf7]" />
        ))}
      </div>
    </div>
  );
}

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 fill-current ${className}`} aria-hidden="true">
      <path d="M12 1.5l2.14 6.36L20.5 10l-6.36 2.14L12 18.5l-2.14-6.36L3.5 10l6.36-2.14L12 1.5z" />
    </svg>
  );
}

function StarRow({ compact = false }: { compact?: boolean }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <StarIcon key={index} className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      ))}
    </>
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

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`stroke-current ${className}`} fill="none" strokeWidth="1.8">
      <path d="M12 3l7 3.2v5.3c0 4.3-2.8 8.3-7 9.9-4.2-1.6-7-5.6-7-9.9V6.2L12 3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function TruckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`stroke-current ${className}`} fill="none" strokeWidth="1.8">
      <path d="M3 7h11v8H3z" />
      <path d="M14 10h3l3 3v2h-6z" />
      <circle cx="8" cy="17" r="2" />
      <circle cx="18" cy="17" r="2" />
    </svg>
  );
}

function HeartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`stroke-current ${className}`} fill="none" strokeWidth="1.8">
      <path d="M12 20.3l-1.1-1C5.1 14 2 11.2 2 7.8 2 5 4.2 3 7 3c1.6 0 3.2.8 4.2 2.1C12.8 3.8 14.4 3 16 3c2.8 0 5 2 5 4.8 0 3.4-3.1 6.2-8.9 11.5L12 20.3z" />
    </svg>
  );
}

function ReturnIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`stroke-current ${className}`} fill="none" strokeWidth="1.8">
      <path d="M8 7H4v4" />
      <path d="M4 11a8 8 0 101.7-5" />
    </svg>
  );
}

function SupportIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`stroke-current ${className}`} fill="none" strokeWidth="1.8">
      <path d="M4 12a8 8 0 0116 0" />
      <path d="M6 13v4a2 2 0 002 2h1v-6H8a2 2 0 00-2 2z" />
      <path d="M18 13v4a2 2 0 01-2 2h-1v-6h1a2 2 0 012 2z" />
    </svg>
  );
}
