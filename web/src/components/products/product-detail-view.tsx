"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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

  const handleBuyNow = () => {
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
    <div className="grid gap-5">
      <section className="rounded-[30px] bg-white/95 p-5 shadow-[0_24px_60px_rgba(153,132,196,0.15)]">
        <div className="relative aspect-square overflow-hidden rounded-[24px] bg-gradient-to-br from-[#fff8ef] to-[#f4f2ff]">
          <Image src={selectedImage} alt={displayName} fill sizes="(max-width: 1024px) 100vw, 640px" className="object-contain p-5" />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {gallery.map((image) => (
            <button
              key={image}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={`relative aspect-square overflow-hidden rounded-[18px] border ${selectedImage === image ? "border-[#8e78ff]" : "border-[#ebe2fb]"}`}
            >
              <Image src={image} alt={displayName} fill sizes="96px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] bg-white/95 p-5 shadow-[0_24px_60px_rgba(153,132,196,0.15)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a89b6]">{product.category}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-[#2f2557]">{displayName}</h1>
        <p className="mt-3 text-sm leading-7 text-[#6d6790]">{product.description}</p>

        <div className="mt-4">
          <PriceBlock
            price={product.price}
            originalPrice={product.originalPrice}
            discountPercent={product.discountPercent}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-[20px] bg-[#f9f3ff] p-3">
            <span className="text-xs text-[#8d83ad]">Recommended Age</span>
            <strong className="mt-1 block text-sm text-[#3e336c]">{product.ageGroup}</strong>
          </div>
          <div className="rounded-[20px] bg-[#f9f3ff] p-3">
            <span className="text-xs text-[#8d83ad]">MOQ</span>
            <strong className="mt-1 block text-sm text-[#3e336c]">{product.moq}</strong>
          </div>
          <div className="rounded-[20px] bg-[#f9f3ff] p-3">
            <span className="text-xs text-[#8d83ad]">Reviews</span>
            <strong className="mt-1 block text-sm text-[#3e336c]">{product.reviewCount || 0}</strong>
          </div>
        </div>

        <p className="mt-4 rounded-[20px] bg-[#fff8ef] px-4 py-3 text-sm leading-6 text-[#805b44]">
          {buildProductBenefit(product)}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(product.features || []).slice(0, 5).map((feature) => (
            <span key={feature} className="rounded-full bg-[#f5efff] px-3 py-2 text-xs font-semibold text-[#66598e]">
              {feature}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <QuantityControl quantity={quantity} min={product.moq} onChange={setQuantity} />
          <Button variant="secondary" className="flex-1" onClick={() => addItem(product, quantity)}>
            Add to Cart
          </Button>
          <Button className="flex-1" onClick={handleBuyNow}>
            Buy Now
          </Button>
        </div>

        <div className="mt-5">
          <TrustMarkers />
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="rounded-[30px] bg-white/90 p-5 shadow-[0_24px_60px_rgba(153,132,196,0.14)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a89b6]">You may also like</p>
              <h2 className="text-2xl font-black tracking-tight text-[#40346f]">
                More from this collection
              </h2>
            </div>
            <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="rounded-full bg-[#fff0f5] px-4 py-2 text-sm font-semibold text-[#d2678f]">
              See All
            </Link>
          </div>
          <ProductGrid products={relatedProducts} />
        </section>
      ) : null}
    </div>
  );
}
