import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/currency.js";
import { ProductImage } from "./ProductImage.jsx";

export const ProductCard = ({
  product,
  variant = "default",
  badgeOverride = "",
  badgeToneOverride = "",
  categoryLabel = "",
  ageLabel = "",
  nameOverride = "",
  descriptionOverride = "",
  benefitLine = "",
  ctaLabel = "Add to Cart",
}) => {
  const { addItem } = useCart();
  const cardClassName = ["product-card", variant].filter(Boolean).join(" ");
  const badgeLabel = badgeOverride || product.badge || "";
  const displayName = nameOverride || product.name;
  const displayCategory = categoryLabel || product.category;
  const displayAge = ageLabel || product.ageGroup;
  const displayCopy = benefitLine || descriptionOverride || product.shortDescription || "";
  const originalPrice =
    product.originalPrice || Math.ceil((Number(product.price || 0) * 1.18) / 50) * 50;
  const discountPercent =
    product.discountPercent ||
    Math.max(
      10,
      Math.round(((originalPrice - Number(product.price || 0)) / originalPrice) * 100)
    );
  const detailPath = product.slug ? `/products/${product.slug}` : "/products";
  const canAddToCart = Boolean(product._id);
  const badgeTone =
    badgeToneOverride ||
    (badgeLabel === "Limited Stock" || product.limitedStock
      ? "warning"
      : badgeLabel === "Best Seller"
        ? "bestseller"
        : badgeLabel === "Viral"
          ? "trend"
          : badgeLabel === "Budget"
            ? "budget"
            : "");

  return (
    <article className={cardClassName}>
      {badgeLabel ? (
        <span className={`product-badge ${badgeTone}`}>{badgeLabel}</span>
      ) : null}
      <Link to={detailPath} className="product-image-link">
        <ProductImage
          src={product.imageUrl}
          alt={displayName}
          loading={variant.includes("hero") ? "eager" : "lazy"}
        />
      </Link>
      <div className="product-meta">
        {displayAge || displayCategory ? (
          <div className="product-tags">
            {displayAge ? <span>{displayAge} years</span> : null}
            {displayCategory ? <span>{displayCategory}</span> : null}
          </div>
        ) : null}
        <Link to={detailPath} className="product-title">
          {displayName}
        </Link>
        {displayCopy ? <p className="product-copy">{displayCopy}</p> : null}
        <div className="price-row">
          <div>
            <strong>{formatCurrency(product.price)}</strong>
            <span>{formatCurrency(originalPrice)}</span>
          </div>
          <span className="discount-pill">{discountPercent}% OFF</span>
        </div>
      </div>

      {canAddToCart ? (
        <button className="primary-button product-card-cta" onClick={() => addItem(product)}>
          {ctaLabel}
        </button>
      ) : (
        <Link className="secondary-button product-card-cta" to={detailPath}>
          Explore
        </Link>
      )}
    </article>
  );
};
