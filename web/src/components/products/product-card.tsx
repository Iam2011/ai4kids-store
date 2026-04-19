"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/shared/button";
import { PriceBlock } from "@/components/shared/price-block";
import { Stars } from "@/components/shared/stars";
import { formatProductName } from "@/lib/utils/normalize-product-text";
import { trackStoreEvent } from "@/lib/analytics/track";
import type { Product } from "@/types/product";

export function ProductCard({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "default" | "home" | "featuredRail";
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const displayName = formatProductName(product.name);
  const canAddToCart = Boolean(product._id);
  const isHome = variant === "home";
  const isFeaturedRail = variant === "featuredRail";
  const showRating = Boolean(product.rating) && !isFeaturedRail;

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

  const handleAction = () => {
    if (!canAddToCart) {
      router.push(`/products/${product.slug}`);
      return;
    }

    addItem(product);
  };

  return (
    <article
      className={[
        "flex h-full flex-col overflow-hidden rounded-[22px] border shadow-[0_16px_34px_rgba(87,68,126,0.12)]",
        isFeaturedRail
          ? "border-[#ece5fa] bg-[linear-gradient(180deg,#ffffff_0%,#fbf7ff_100%)] p-2.5"
          : isHome
            ? "border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,244,255,0.96))] p-2.5"
            : "border-[#efe9fb] bg-[linear-gradient(180deg,#ffffff_0%,#fbf8ff_100%)] p-3",
      ].join(" ")}
    >
      <Link
        href={`/products/${product.slug}`}
        onClick={trackProductClick}
        className={[
          "relative block overflow-hidden rounded-[18px] border border-white/80",
          isFeaturedRail
            ? "mb-2.5 aspect-[1/0.95] bg-[linear-gradient(180deg,#f6fbff_0%,#fdf7ff_100%)]"
            : isHome
              ? "mb-2.5 aspect-[1/0.92] bg-[linear-gradient(180deg,#f8fbff_0%,#fff7fb_100%)]"
              : "mb-3 aspect-square bg-[linear-gradient(180deg,#f8fbff_0%,#fff9fc_100%)]",
        ].join(" ")}
      >
        <Image
          src={product.imageUrl}
          alt={displayName}
          fill
          sizes="(max-width: 768px) 50vw, 220px"
          className={[
            "object-contain",
            isFeaturedRail
              ? "p-3"
              : isHome
                ? "p-3.5"
                : "p-4",
          ].join(" ")}
        />
      </Link>

      <div className="flex flex-1 flex-col">
        <Link
          href={`/products/${product.slug}`}
          onClick={trackProductClick}
          className={[
            "line-clamp-2 font-black text-[#2c224f]",
            isFeaturedRail
              ? "min-h-[2.5rem] text-[0.95rem] leading-5"
              : isHome
                ? "min-h-[2.6rem] text-[0.96rem] leading-5"
                : "min-h-[2.8rem] text-[1rem] leading-5",
          ].join(" ")}
        >
          {displayName}
        </Link>

        <div className={isFeaturedRail ? "mt-1" : "mt-1.5"}>
          <PriceBlock price={product.price} originalPrice={product.originalPrice} />
        </div>

        {showRating ? (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#746d93]">
            <Stars className="text-[11px]" />
            <span>{Number(product.rating || 4.5).toFixed(1)}</span>
          </div>
        ) : null}

        {!isFeaturedRail ? (
          <div className="mt-3">
            <Button
              variant={isHome ? "primary" : "secondary"}
              className="min-h-9 w-full px-3 py-2 text-[12px] font-bold"
              onClick={handleAction}
            >
              {canAddToCart ? "Add to Cart" : "Explore"}
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
