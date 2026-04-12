import { ProductCard } from "./ProductCard.jsx";
import { SectionHeading } from "./SectionHeading.jsx";

const placeholderCards = Array.from({ length: 8 }, (_, index) => index);

export const FeaturedProducts = ({ products, loading }) => (
  <section className="section-panel featured-products-panel">
    <SectionHeading
      eyebrow="Viral picks"
      title="Trending toys families are buying right now"
      description="Premium scooters, action favorites, and remote toys merchandised for fast decisions."
      actionLabel="See full catalog"
      actionTo="/products?featured=true"
    />

    {loading ? (
      <div className="featured-grid" aria-label="Loading featured toys">
        {placeholderCards.map((card) => (
          <article key={card} className="product-card viral-pick placeholder-card">
            <div className="placeholder-image" />
            <div className="placeholder-line" />
            <div className="placeholder-line short" />
            <div className="placeholder-line" />
          </article>
        ))}
      </div>
    ) : (
      <div className="featured-grid">
        {products.map((product) => (
          <ProductCard
            key={product._id || product.imageUrl}
            product={product}
            variant="viral-pick"
            badgeOverride={product.badge}
            nameOverride={product.displayName}
            descriptionOverride={product.benefit}
            categoryLabel={product.category}
            ageLabel={product.ageGroup}
          />
        ))}
      </div>
    )}
  </section>
);
