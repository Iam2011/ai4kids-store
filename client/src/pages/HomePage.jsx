import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../api/storeApi.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { TrustStrip } from "../components/TrustStrip.jsx";
import { useCart } from "../context/CartContext.jsx";
import { homepageCategories } from "../constants/storefrontCategories.js";
import { viralToysCombo } from "../constants/comboOffer.js";
import {
  buildProductBenefit,
  getHeroSupportCopy,
  selectBestSellerProducts,
  selectNewArrivalProducts,
  selectTrendingProducts,
} from "../utils/catalogMerchandising.js";

const reviewCards = [
  {
    name: "Neha S.",
    title: "Verified Buyer",
    copy: "Amazing toy picks and a premium shopping flow. The new catalog feels richer and much easier to browse.",
  },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const { addCombo } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);
  const [homepageError, setHomepageError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomepageProducts = async () => {
      try {
        const [featuredResponse, latestResponse] = await Promise.all([
          getProducts({ limit: 72, sort: "featured" }),
          getProducts({ limit: 24, sort: "latest" }),
        ]);

        setFeaturedProducts(featuredResponse.products || []);
        setNewArrivalProducts(latestResponse.products || []);
        setHomepageError("");
      } catch (error) {
        setHomepageError(error.response?.data?.message || "Unable to refresh homepage toys.");
      } finally {
        setLoading(false);
      }
    };

    loadHomepageProducts();
  }, []);

  const bestSellerProducts = useMemo(
    () => selectBestSellerProducts(featuredProducts, 3),
    [featuredProducts]
  );
  const newArrivalRail = useMemo(
    () => selectNewArrivalProducts(newArrivalProducts, 4),
    [newArrivalProducts]
  );
  const trendingProducts = useMemo(
    () => selectTrendingProducts(featuredProducts, 4),
    [featuredProducts]
  );
  const heroSupport = useMemo(() => getHeroSupportCopy(featuredProducts), [featuredProducts]);

  const handleComboCheckout = () => {
    addCombo(viralToysCombo);
    navigate("/checkout");
  };

  return (
    <div className="page-stack app-homepage">
      <section className="hero-reference-card">
        <button type="button" className="hero-image-button" onClick={handleComboCheckout}>
          <img
            src="/assets/ui/hero-banner.png"
            alt="AI4Kids combo hero banner"
            className="hero-reference-image"
          />
        </button>

        {heroSupport.highlight ? (
          <div className="hero-support-strip">
            <span className="mini-label">Catalog highlight</span>
            <p>{heroSupport.highlight}</p>
          </div>
        ) : null}
      </section>

      <TrustStrip />

      <section className="section-panel category-showcase-panel">
        <div className="rail-header">
          <h2>Shop by Category</h2>
          <Link to="/products">View All</Link>
        </div>

        <div className="category-showcase-grid">
          {homepageCategories.map((category) => (
            <Link key={category.label} to={category.to} className="category-showcase-card">
              <span
                className={`category-sprite category-sprite-${category.sprite}`}
                aria-hidden="true"
              />
              <strong>{category.label}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-panel home-rail-card">
        <div className="rail-header">
          <h2>Best Sellers</h2>
        </div>

        {loading ? (
          <div className="mini-rail">
            {Array.from({ length: 3 }, (_, index) => (
              <article key={index} className="product-card mini-card placeholder-card">
                <div className="placeholder-image" />
                <div className="placeholder-line" />
                <div className="placeholder-line short" />
              </article>
            ))}
          </div>
        ) : (
          <div className="mini-rail">
            {bestSellerProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={{
                  ...product,
                  shortDescription: buildProductBenefit(product),
                }}
                variant="mini"
              />
            ))}
          </div>
        )}

        <p className="rail-footnote">COD Fee: Rs 40 per Product</p>
        <div className="carousel-dots" aria-hidden="true">
          <span className="active" />
          <span />
          <span />
        </div>
      </section>

      <section className="section-panel home-rail-card">
        <div className="rail-header">
          <h2>New Arrivals</h2>
          <Link to="/products?sort=latest">View All</Link>
        </div>

        <div className="mini-rail arrivals-rail">
          {(loading ? [] : newArrivalRail).map((product) => (
            <ProductCard
              key={product._id}
              product={{
                ...product,
                shortDescription: buildProductBenefit(product),
              }}
              variant="mini"
            />
          ))}
        </div>

        <div className="carousel-dots" aria-hidden="true">
          <span className="active" />
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="section-panel home-rail-card">
        <div className="rail-header">
          <h2>Trending Picks</h2>
          <Link to="/products?sort=discount">Top Deals</Link>
        </div>

        <div className="mini-rail arrivals-rail">
          {(loading ? [] : trendingProducts).map((product) => (
            <ProductCard
              key={product._id}
              product={{
                ...product,
                shortDescription: buildProductBenefit(product),
              }}
              variant="mini"
            />
          ))}
        </div>
      </section>

      <section className="section-panel why-card-panel">
        <div className="rail-header">
          <h2>Why Shop With Us?</h2>
        </div>

        <div className="review-grid">
          {reviewCards.map((review) => (
            <article key={review.name} className="buyer-review-card">
              <div className="buyer-avatar" aria-hidden="true" />
              <div className="buyer-review-copy">
                <strong>{review.name}</strong>
                <span className="review-stars">
                  <span className="rating-stars" aria-hidden="true">
                    <span>&#9733;</span>
                    <span>&#9733;</span>
                    <span>&#9733;</span>
                    <span>&#9733;</span>
                    <span>&#9733;</span>
                  </span>
                  {review.title}
                </span>
                <p>{review.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {homepageError ? (
        <section className="section-panel">
          <p className="helper-text">{homepageError}</p>
        </section>
      ) : null}
    </div>
  );
};
