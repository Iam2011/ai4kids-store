"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/cart-provider";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { PriceBlock } from "@/components/shared/price-block";
import { Stars } from "@/components/shared/stars";
import { buildProductBenefit } from "@/lib/utils/catalog-merchandising";
import { formatProductName } from "@/lib/utils/normalize-product-text";
import { trackStoreEvent } from "@/lib/analytics/track";
import type { Product } from "@/types/product";

const buildFeatureList = (product: Product) => {
  if (Array.isArray(product.features) && product.features.length) {
    return product.features.slice(0, 3);
  }

  if (product.category === "Outdoor & Sports Toys") return ["Outdoor Play", "Strong Build", "Active Fun"];
  if (product.category === "Gun & Blasters") return ["Action Play", "Durable", "Rechargeable"];
  if (product.category === "Educational & Learning Toys") return ["Smart Play", "Creative", "Skill Building"];

  return ["High Speed", "Shockproof", "Rechargeable"];
};

export function ProductCard({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "default" | "home" | "featuredRail";
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const benefit = buildProductBenefit(product);
  const displayName = formatProductName(product.name);
  const reviewCount = product.reviewCount || 120;
  const canAddToCart = Boolean(product._id);
  const badge = product.featured ? "Best Seller" : product.badge || "New";
  const features = buildFeatureList(product);
  const isHome = variant === "home";
  const isFeaturedRail = variant === "featuredRail";

  const trackProductClick = () => {
    void trackStoreEvent({
      eventType: "product_click",
      product: {
        productId: product._id,
        productName: product.name,
        category: product.category,
      },
    }).catch(() => {});
  };

  const handleBuyNow = () => {
    void trackStoreEvent({
      eventType: "buy_now_click",
      product: {
        productId: product._id,
        productName: product.name,
        category: product.category,
      },
    }).catch(() => {});

    if (!canAddToCart) {
      router.push(`/products/${product.slug}`);
      return;
    }

    addItem(product);
    router.push("/checkout");
  };

  return (
    <article
      className={[
        "flex h-full flex-col overflow-hidden",
        isFeaturedRail
          ? "min-w-[188px] rounded-[22px] border border-[#ebe4fb] bg-white p-2.5 shadow-[0_14px_28px_rgba(148,123,191,0.1)]"
          : isHome
          ? "rounded-[28px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,246,252,0.96))] p-2.5 shadow-[0_18px_40px_rgba(187,153,224,0.2)]"
          : "rounded-[24px] bg-white p-3 shadow-[0_18px_44px_rgba(148,123,191,0.12)]",
      ].join(" ")}
    >
      <div
        className={[
          "relative overflow-hidden",
          isFeaturedRail
            ? "mb-3 rounded-[18px] border border-[#eef2fb] bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_100%)]"
            : isHome
            ? "mb-2.5 rounded-[22px] border border-white/80 bg-[radial-gradient(circle_at_top,#fffdfd_5%,#fff4fb_52%,#f4f1ff_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]"
            : "mb-3 rounded-[20px] bg-gradient-to-br from-[#fff8ef] to-[#f3f2ff]",
        ].join(" ")}
      >
        {!isFeaturedRail ? (
        <div className={isHome ? "absolute left-2 top-2 z-10" : "absolute left-2 top-2 z-10"}>
          <Badge
            tone={product.featured ? "accent" : "warm"}
            className={isHome ? "bg-[#f7c3e4] text-[#8d4274] shadow-none" : "shadow-[0_8px_18px_rgba(239,92,130,0.18)]"}
          >
            {badge}
          </Badge>
        </div>
        ) : null}
        {!isFeaturedRail && product.discountPercent ? (
          <div className="absolute right-2 top-2 z-10">
            <Badge
              tone="soft"
              className={isHome ? "bg-[#e2d8ff] text-[#7857d2] shadow-none" : "shadow-[0_8px_18px_rgba(123,86,217,0.16)]"}
            >
              {product.discountPercent}% OFF
            </Badge>
          </div>
        ) : null}
        <Link
          href={`/products/${product.slug}`}
          onClick={trackProductClick}
          className={
            isFeaturedRail
              ? "relative block aspect-[0.95/0.9]"
              : isHome
                ? "relative block aspect-[0.98/1]"
                : "relative block aspect-square"
          }
        >
          <Image
            src={product.imageUrl}
            alt={displayName}
            fill
            sizes="(max-width: 768px) 50vw, 260px"
            className={
              isFeaturedRail
                ? `object-contain p-3 ${product.homeRailEligible ? "home-rail-float" : ""}`
                : isHome
                  ? "object-contain p-4 pt-11"
                  : "object-contain p-5 pt-12"
            }
          />
        </Link>
      </div>

      <div className={isHome ? "flex flex-1 flex-col px-1 pb-1" : "flex flex-1 flex-col"}>
        {isFeaturedRail ? (
          <>
            <Link
              href={`/products/${product.slug}`}
              onClick={trackProductClick}
              className="line-clamp-2 min-h-[2.8rem] text-[1.05rem] font-black leading-[1.35rem] text-[#2f2557]"
            >
              {displayName}
            </Link>

            <div className="mt-1">
              <PriceBlock price={product.price} />
            </div>
          </>
        ) : (
          <>
        <Link
          href={`/products/${product.slug}`}
          onClick={trackProductClick}
          className={[
            "line-clamp-2 font-black text-[#2f2557]",
            isHome ? "min-h-[2.8rem] text-[1.02rem] leading-[1.35rem]" : "min-h-10 text-base leading-5",
          ].join(" ")}
        >
          {displayName}
        </Link>

        <p className={isHome ? "mt-1.5 line-clamp-1 text-[11px] font-medium text-[#8d83aa]" : "mt-2 line-clamp-2 text-xs leading-5 text-[#776f97]"}>
          {benefit}
        </p>

        {isHome ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {features.slice(0, 2).map((feature, index) => (
              <span
                key={feature}
                className={[
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                  index === 0 ? "bg-[#f1e6ff] text-[#7357ac]" : "bg-[#fff0d9] text-[#9f7a33]",
                ].join(" ")}
              >
                {feature}
              </span>
            ))}
          </div>
        ) : variant === "default" ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {features.map((feature) => (
              <span
                key={feature}
                className="rounded-full bg-[#f8f3ff] px-2 py-1 text-[10px] font-semibold text-[#6d5d9a]"
              >
                {feature}
              </span>
            ))}
          </div>
        ) : null}

        <div className={isHome ? "mt-3" : "mt-3"}>
          <PriceBlock
            price={product.price}
            originalPrice={product.originalPrice}
            discountPercent={product.discountPercent}
          />
        </div>

        <div className={isHome ? "mt-1.5 flex items-center gap-1 text-[11px] text-[#7b749a]" : "mt-2 flex items-center gap-1 text-xs text-[#7b749a]"}>
          <Stars />
          <span>{Number(product.rating || 4.5).toFixed(1)}</span>
          <span>({reviewCount})</span>
        </div>

        <div className={isHome ? "mt-3 grid grid-cols-2 gap-2" : "mt-4 grid grid-cols-2 gap-2"}>
          <Button
            variant="secondary"
            className={isHome ? "min-h-10 px-2 text-[11px]" : "px-2 text-xs"}
            onClick={() => (canAddToCart ? addItem(product) : router.push(`/products/${product.slug}`))}
          >
            {canAddToCart ? "Add to Cart" : "Explore"}
          </Button>
          <Button className={isHome ? "min-h-10 px-2 text-[11px]" : "px-2 text-xs"} onClick={handleBuyNow}>
            Buy Now
          </Button>
        </div>
          </>
        )}
      </div>
    </article>
  );
}
