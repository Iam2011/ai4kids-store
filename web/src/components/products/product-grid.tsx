import type { Product } from "@/types/product";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  variant = "default",
}: {
  products: Product[];
  variant?: "default" | "home" | "featuredRail";
}) {
  if (variant === "featuredRail") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <ProductCard key={product._id || product.slug} product={product} variant={variant} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((product) => (
        <ProductCard key={product._id || product.slug} product={product} variant={variant} />
      ))}
    </div>
  );
}
