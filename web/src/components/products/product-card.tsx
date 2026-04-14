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
  variant?: "default" | "home";
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const benefit = buildProductBenefit(product);
  const reviewCount = product.reviewCount || 120;
  const canAddToCart = Boolean(product._id);
  const badge = product.featured ? "Best Seller" : product.badge || "New";
  const features = buildFeatureList(product);

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
    <article className="flex h-full flex-col rounded-[24px] bg-white p-3 shadow-[0_18px_44px_rgba(148,123,191,0.12)]">
      <div className="relative mb-3 overflow-hidden rounded-[20px] bg-gradient-to-br from-[#fff8ef] to-[#f3f2ff]">
        <div className="absolute left-2 top-2 z-10 flex gap-1">
          <Badge tone={product.featured ? "accent" : "warm"}>{badge}</Badge>
          <Badge tone="soft">{product.discountPercent}% OFF</Badge>
        </div>
        <Link href={`/products/${product.slug}`} onClick={trackProductClick} className="relative block aspect-square">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 260px"
            className="object-contain p-4"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col">
        <Link
          href={`/products/${product.slug}`}
          onClick={trackProductClick}
          className="line-clamp-2 text-base font-black leading-5 text-[#2f2557]"
        >
          {product.name}
        </Link>

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#776f97]">{benefit}</p>

        {variant === "default" ? (
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

        <div className="mt-3">
          <PriceBlock
            price={product.price}
            originalPrice={product.originalPrice}
            discountPercent={variant === "home" ? undefined : product.discountPercent}
          />
        </div>

        <div className="mt-2 flex items-center gap-1 text-xs text-[#7b749a]">
          <Stars />
          <span>{Number(product.rating || 4.5).toFixed(1)}</span>
          <span>({reviewCount})</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            className="px-2 text-xs"
            onClick={() => (canAddToCart ? addItem(product) : router.push(`/products/${product.slug}`))}
          >
            {canAddToCart ? "Add to Cart" : "Explore"}
          </Button>
          <Button className="px-2 text-xs" onClick={handleBuyNow}>
            Buy Now
          </Button>
        </div>
      </div>
    </article>
  );
}
