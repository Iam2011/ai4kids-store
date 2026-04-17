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
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
