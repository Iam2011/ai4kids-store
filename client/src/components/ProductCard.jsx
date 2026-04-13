import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/currency.js";
import { ProductImage } from "./ProductImage.jsx";

const buildFeatureList = (product) => {
  if (product.category === "Outdoor") {
    return ["Stable Ride", "Strong Build", "Light & Music"];
  }

  if (product.category === "Action Toys") {
    return ["Action Play", "Durable", "Rechargeable"];
  }

  return ["High Speed", "Shockproof", "Rechargeable"];
};

const FeatureIcon = ({ index }) => {
  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2l7 4v6c0 5-3.3 8.8-7 10-3.7-1.2-7-5-7-10V6l7-4zm0 3.1L7 7.9v4.1c0 3.9 2.4 6.9 5 8 2.6-1.1 5-4.1 5-8V7.9l-5-2.8z" fill="currentColor" />
      </svg>
    );
  }

  if (index === 2) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4h10v16H7V4zm2 2v12h6V6H9zm1 10h4v2h-4v-2z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 2L4 13h6l-1 9 9-11h-6l1-9z" fill="currentColor" />
    </svg>
  );
};

const RatingStars = () => (
  <span className="rating-stars" aria-hidden="true">
    <span>★</span>
    <span>★</span>
    <span>★</span>
    <span>★</span>
    <span className="muted">★</span>
  </span>
);

export const ProductCard = ({
  product,
  variant = "showcase",
  badgeOverride = "",
  badgeToneOverride = "",
  categoryLabel = "",
  ageLabel = "",
  nameOverride = "",
  descriptionOverride = "",
  benefitLine = "",
  ctaLabel = "Add to Cart",
}) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const displayName = nameOverride || product.displayName || product.name;
  const displayCategory = categoryLabel || product.category;
  const displayAge = ageLabel || product.ageGroup;
  const displayCopy = benefitLine || descriptionOverride || product.shortDescription || "";
  const originalPrice =
    product.originalPrice || Math.ceil((Number(product.price || 0) * 1.2) / 50) * 50;
  const discountPercent =
    product.discountPercent ||
    Math.max(10, Math.round(((originalPrice - Number(product.price || 0)) / originalPrice) * 100));
  const detailPath = product.slug ? `/products/${product.slug}` : "/products";
  const canAddToCart = Boolean(product._id);
  const badgeLabel = badgeOverride || product.badge || "NEW";
  const showcaseBadgeLabel =
    badgeOverride ||
    (product.featured || product.badge === "Viral" ? "BEST SELLER" : "NEW");
  const rating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 120;
  const features = buildFeatureList(product);
  const miniDisplayBadge = badgeLabel.includes("%") ? "NEW" : badgeLabel;
  const topBadgeTone =
    badgeToneOverride ||
    (badgeLabel === "Best Seller" || badgeLabel === "BEST SELLER" ? "red" : "orange");

  const handleBuyNow = () => {
    if (!canAddToCart) {
      navigate(detailPath);
      return;
    }
    addItem(product);
    navigate("/checkout");
  };

  if (variant === "mini") {
    return (
      <article className="product-card mini-card">
        <span className="mini-top-badge">{miniDisplayBadge}</span>
        <span className="mini-sale-badge">{discountPercent}%</span>
        <Link to={detailPath} className="product-image-link">
          <ProductImage src={product.imageUrl} alt={displayName} />
        </Link>
        <div className="mini-card-body">
          <Link to={detailPath} className="mini-card-title">
            {displayName}
          </Link>
          <div className="mini-rating-row">
            <RatingStars />
            <span>{reviewCount}</span>
          </div>
          <div className="mini-price-row">
            <strong>{formatCurrency(product.price)}</strong>
          </div>
          {canAddToCart ? (
            <button type="button" className="mini-card-button" onClick={() => addItem(product)}>
              Add to Cart
            </button>
          ) : (
            <Link className="mini-card-button secondary" to={detailPath}>
              Explore
            </Link>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="product-card showcase-card">
      <div className="showcase-media-wrap">
        <span className={`showcase-top-badge ${topBadgeTone}`}>{showcaseBadgeLabel}</span>
        <span className="showcase-discount-badge">{discountPercent}% OFF</span>
        <Link to={detailPath} className="product-image-link">
          <ProductImage src={product.imageUrl} alt={displayName} wrapperClassName="showcase-image-shell" />
        </Link>
      </div>

      <div className="showcase-copy">
        <Link to={detailPath} className="showcase-title">
          {displayName}
        </Link>
        <p className="showcase-copy-line">
          {displayCopy || `${displayCategory} toy for age ${displayAge} shoppers.`}
        </p>

        <div className="showcase-feature-row">
          {features.map((feature, index) => (
            <span key={feature}>
              <FeatureIcon index={index} />
              {feature}
            </span>
          ))}
        </div>

        <div className="showcase-price-row">
          <span className="showcase-old-price">{formatCurrency(originalPrice)}</span>
          <strong>{formatCurrency(product.price)}</strong>
          <span className="showcase-sale-pill">{discountPercent}% OFF</span>
        </div>

        <div className="showcase-rating-row">
          <RatingStars />
          <span>{rating.toFixed(1)}</span>
          <span>({reviewCount} Reviews)</span>
        </div>

        <div className="showcase-actions">
          {canAddToCart ? (
            <button
              type="button"
              className="secondary-button outline-action"
              onClick={() => addItem(product)}
            >
              Add to Cart
            </button>
          ) : (
            <Link className="secondary-button outline-action" to={detailPath}>
              Explore
            </Link>
          )}

          <button type="button" className="primary-button solid-action" onClick={handleBuyNow}>
            {ctaLabel === "Add to Cart" ? "Buy Now" : ctaLabel}
          </button>
        </div>
      </div>
    </article>
  );
};
