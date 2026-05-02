"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/shared/button";
import { PriceBlock } from "@/components/shared/price-block";
import { ProductGrid } from "@/components/products/product-grid";
import { QuantityControl } from "@/components/cart/quantity-control";
import { TrustMarkers } from "@/components/trust/trust-markers";
import { buildProductBenefit } from "@/lib/utils/catalog-merchandising";
import { formatProductName } from "@/lib/utils/normalize-product-text";
import { trackStoreEvent } from "@/lib/analytics/track";
import type { Product } from "@/types/product";

export function ProductDetailView({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(product.moq);
  const displayName = formatProductName(product.name);
  const gallery = product.gallery?.length ? product.gallery : [product.imageUrl];
  const [selectedImage, setSelectedImage] = useState(gallery[0] || product.imageUrl);
  const canPurchase = Number(product.stockCount || 0) > 0;
  const showLowStockHint = Boolean(product.limitedStock) || (Number(product.stockCount || 0) > 0 && Number(product.stockCount || 0) <= 5);
  const showRating = Number(product.rating || 0) > 0 && Number(product.reviewCount || 0) > 0;
  const hasDiscount = Number(product.discountPercent || 0) > 0;

  const featureList = useMemo(
    () => (product.features || []).filter(Boolean).slice(0, 8),
    [product.features]
  );

  useEffect(() => {
    void trackStoreEvent({
      eventType: "product_view",
      product: {
        productId: product._id,
        productName: product.name,
        category: product.category,
      },
    }).catch(() => {});
  }, [product._id, product.category, product.name]);

  const handleAddToCart = () => {
    if (!canPurchase) return;
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    if (!canPurchase) return;
    void trackStoreEvent({
      eventType: "buy_now_click",
      product: {
        productId: product._id,
        productName: product.name,
        category: product.category,
      },
    }).catch(() => {});
    addItem(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="grid gap-4 sm:gap-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr] lg:items-start">
        <section className="rounded-[28px] border border-white/80 bg-white/95 p-4 shadow-[0_22px_52px_rgba(153,132,196,0.15)] sm:rounded-[30px] sm:p-5">
          <div className="relative aspect-square overflow-hidden rounded-[22px] border border-white/80 bg-[linear-gradient(180deg,#f8fbff_0%,#fff9fd_100%)]">
            <div className="pointer-events-none absolute inset-x-6 bottom-4 h-4 rounded-full bg-[radial-gradient(circle,rgba(72,57,111,0.14),transparent_72%)] blur-[8px]" />
            <Image
              src={selectedImage}
              alt={displayName}
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-contain p-4 sm:p-5"
            />
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2.5">
            {gallery.map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={[
                  "relative aspect-square overflow-hidden rounded-[14px] border bg-white transition-shadow",
                  selectedImage === image
                    ? "border-[#8e78ff] shadow-[0_8px_20px_rgba(129,104,204,0.18)]"
                    : "border-[#ebe2fb]",
                ].join(" ")}
              >
                <Image src={image} alt={displayName} fill sizes="96px" className="object-contain p-2" />
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/80 bg-white/95 p-4 shadow-[0_22px_52px_rgba(153,132,196,0.15)] sm:rounded-[30px] sm:p-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="rounded-full bg-[#f3ecff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#6e59a8]">
              {product.category}
            </p>
            {product.badge ? (
              <p className="rounded-full bg-[#fff0e8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[#d46f4a]">
                {product.badge}
              </p>
            ) : null}
            {showLowStockHint ? (
              <p className="rounded-full bg-[#fff1ef] px-3 py-1 text-[11px] font-bold text-[#cf5f56]">
                Limited stock
              </p>
            ) : null}
          </div>

          <h1 className="mt-3 text-[1.65rem] font-black leading-tight tracking-tight text-[#2f2557] sm:text-[1.9rem]">
            {displayName}
          </h1>

          {showRating ? (
            <p className="mt-2 text-sm font-semibold text-[#72678f]">
              {Number(product.rating).toFixed(1)} rating ({product.reviewCount} reviews)
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <PriceBlock
              price={product.price}
              originalPrice={product.originalPrice}
              discountPercent={product.discountPercent}
            />
            {hasDiscount ? (
              <span className="rounded-full bg-[#fff0e7] px-2.5 py-1 text-[11px] font-bold text-[#de6b45]">
                {product.discountPercent}% OFF
              </span>
            ) : null}
          </div>

          {!canPurchase ? (
            <p className="mt-3 rounded-[14px] bg-[#fff2f2] px-3 py-2 text-sm font-semibold text-[#c45555]">
              Currently unavailable
            </p>
          ) : null}

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <InfoPill label="Age Group" value={product.ageGroup} />
            <InfoPill label="MOQ" value={String(product.moq)} />
            <InfoPill label="Stock" value={String(product.stockCount)} />
          </div>

          <div className="mt-5 hidden items-center gap-3 lg:flex">
            <QuantityControl quantity={quantity} min={product.moq} onChange={setQuantity} />
            <Button
              variant="secondary"
              className="min-h-11 flex-1"
              onClick={handleAddToCart}
              disabled={!canPurchase}
            >
              Add to Cart
            </Button>
            <Button className="min-h-11 flex-1" onClick={handleBuyNow} disabled={!canPurchase}>
              Buy Now
            </Button>
          </div>

          <div className="mt-5 hidden lg:block">
            <TrustMarkers />
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-white/80 bg-white/95 p-4 shadow-[0_22px_52px_rgba(153,132,196,0.14)] sm:rounded-[30px] sm:p-5">
        <h2 className="text-[1.2rem] font-black text-[#3a2f66]">Product Details</h2>
        <p className="mt-2 text-sm leading-7 text-[#6d6790]">{product.description}</p>
        <p className="mt-4 rounded-[18px] bg-[#fff8ef] px-4 py-3 text-sm leading-6 text-[#805b44]">
          {buildProductBenefit(product)}
        </p>
      </section>

      {featureList.length ? (
        <section className="rounded-[28px] border border-white/80 bg-white/95 p-4 shadow-[0_22px_52px_rgba(153,132,196,0.14)] sm:rounded-[30px] sm:p-5">
          <h2 className="text-[1.2rem] font-black text-[#3a2f66]">Key Features</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {featureList.map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-[#ece3fb] bg-[#f6f1ff] px-3 py-2 text-xs font-semibold text-[#66598e]"
              >
                {feature}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-white/80 bg-white/95 p-4 shadow-[0_22px_52px_rgba(153,132,196,0.14)] sm:rounded-[30px] sm:p-5 lg:hidden">
        <h2 className="text-[1.2rem] font-black text-[#3a2f66]">Why kids love it</h2>
        <div className="mt-3">
          <TrustMarkers />
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="rounded-[28px] border border-white/80 bg-white/92 p-4 shadow-[0_24px_60px_rgba(153,132,196,0.14)] sm:rounded-[30px] sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a89b6]">You may also like</p>
              <h2 className="text-2xl font-black tracking-tight text-[#40346f]">More from this collection</h2>
            </div>
            <Link
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="rounded-full border border-[#efdff9] bg-[#fff5fb] px-4 py-2 text-sm font-semibold text-[#c85a87]"
            >
              See All
            </Link>
          </div>
          <ProductGrid products={relatedProducts} />
        </section>
      ) : null}

      <div className="h-24 lg:hidden" />

      <div className="fixed inset-x-3 bottom-[5.5rem] z-30 lg:hidden">
        <div className="mx-auto flex max-w-[430px] items-center gap-2.5 rounded-[20px] border border-white/80 bg-white/95 p-2.5 shadow-[0_20px_48px_rgba(76,58,124,0.2)] backdrop-blur">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9b8ab7]">Price</p>
            <strong className="block truncate text-[1.05rem] font-black text-[#2d2557]">Rs {product.price}</strong>
          </div>
          <Button
            variant="secondary"
            className="min-h-10 px-3 text-[12px] font-bold"
            onClick={handleAddToCart}
            disabled={!canPurchase}
          >
            Add
          </Button>
          <Button className="min-h-10 px-4 text-[12px] font-bold" onClick={handleBuyNow} disabled={!canPurchase}>
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] bg-[#f8f2ff] px-3 py-2.5">
      <p className="text-[11px] font-medium text-[#9186af]">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#3e336c]">{value}</p>
    </div>
  );
}
