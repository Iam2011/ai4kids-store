import type { Product } from "@/types/product";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  variant = "default",
}: {
  products: Product[];
  variant?: "default" | "home" | "featuredRail";
}) {
  return (
    <div
      className={
        variant === "featuredRail"
          ? "grid grid-cols-2 gap-3"
          : "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
      }
    >
      {products.map((product) => (
        <ProductCard key={product._id || product.slug} product={product} variant={variant} />
      ))}
    </div>
  );
}
