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
  const hasDiscount = Number(product.discountPercent || 0) > 0;
  const showRating = Number(product.rating || 0) > 0 && Number(product.reviewCount || 0) > 0 && !isFeaturedRail;
  const showLowStockHint = Boolean(product.limitedStock) || (product.stockCount > 0 && product.stockCount <= 5);

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
        "flex h-full flex-col overflow-hidden rounded-[20px] border bg-white shadow-[0_14px_28px_rgba(87,68,126,0.1)]",
        isFeaturedRail
          ? "border-[#ebe3fb] p-2.5"
          : isHome
            ? "border-[#efe6fc] p-2.5 sm:p-3"
            : "border-[#efe6fc] p-2.5 sm:p-3",
      ].join(" ")}
    >
      <Link
        href={`/products/${product.slug}`}
        onClick={trackProductClick}
        className={[
          "relative block overflow-hidden rounded-[16px] border border-white/80 bg-[linear-gradient(180deg,#f8fbff_0%,#fff9fd_100%)]",
          isFeaturedRail
            ? "mb-2.5 aspect-[1/0.95]"
            : isHome
              ? "mb-2.5 aspect-[1/0.92]"
              : "mb-2.5 aspect-[1/0.92]",
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-x-3 bottom-1.5 h-3 rounded-full bg-[radial-gradient(circle,rgba(75,57,120,0.14),transparent_72%)] blur-[6px]" />

        {product.badge ? (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-[#f5eeff] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.05em] text-[#6c59a8]">
            {product.badge}
          </span>
        ) : null}

        {hasDiscount ? (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-[#fff0e7] px-2 py-1 text-[10px] font-bold text-[#e06d45]">
            {product.discountPercent}% OFF
          </span>
        ) : null}

        <Image
          src={product.imageUrl}
          alt={displayName}
          fill
          sizes={isFeaturedRail ? "(max-width: 768px) 50vw, 220px" : "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"}
          className={[
            "object-contain",
            isFeaturedRail
              ? "p-3"
              : isHome
                ? "p-3.5 pt-4"
                : "p-3.5 pt-4",
          ].join(" ")}
        />
      </Link>

      <div className="flex flex-1 flex-col">
        <Link
          href={`/products/${product.slug}`}
          onClick={trackProductClick}
          className={[
            "font-black text-[#2c224f]",
            isFeaturedRail
              ? "line-clamp-2 min-h-[2.55rem] text-[0.95rem] leading-5"
              : "line-clamp-3 min-h-[3.45rem] text-[0.94rem] leading-[1.15rem] sm:line-clamp-2 sm:min-h-[2.7rem] sm:text-[0.98rem] sm:leading-5",
          ].join(" ")}
        >
          {displayName}
        </Link>

        <div className={isFeaturedRail ? "mt-1" : "mt-1.5"}>
          <PriceBlock
            price={product.price}
            originalPrice={product.originalPrice}
            discountPercent={product.discountPercent}
          />
        </div>

        {showLowStockHint && !isFeaturedRail ? (
          <p className="mt-1.5 text-[11px] font-semibold text-[#d06858]">
            Limited stock
          </p>
        ) : null}

        {showRating ? (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#746d93]">
            <Stars className="text-[11px]" />
            <span>{Number(product.rating).toFixed(1)}</span>
            <span className="text-[#9386b0]">({product.reviewCount})</span>
          </div>
        ) : null}

        {!isFeaturedRail ? (
          <div className="mt-3">
            <Button
              variant={isHome ? "primary" : "secondary"}
              className="min-h-10 w-full px-3 py-2 text-[12px] font-bold sm:min-h-11 sm:text-[13px]"
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
