import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../api/storeApi.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { TrustStrip } from "../components/TrustStrip.jsx";
import { useCart } from "../context/CartContext.jsx";
import { homepageCategories } from "../constants/storefrontCategories.js";
import { viralToysCombo } from "../constants/comboOffer.js";
import { buildProductBenefit } from "../utils/catalogMerchandising.js";
import { trackStoreEvent } from "../utils/visitTracking.js";

const homepageShowcaseNames = [
  "T22 SCOOTER LIGHT MUSIC SENSOR",
  "TB 5141 ROCK CAR BIG TOY BOI",
  "GSH818-36 BUBBLE GUN CHARGEABLE",
  "3012 THUNDER STRIKE",
  "GY 2090-14 GOYO STUNT CAR",
  "2915 THUNDER STRIKE GUN",
  "611 SCOOTER",
  "S52P 4K SCREEN DRONE",
  "668-25 PRINCESS HOUSE 156 PCS",
  "CH1328 MAGNETIC MIND CRAFT 169 PCS",
];

const normalizeName = (value) => String(value || "").trim().toLowerCase();

const resolveShowcaseProduct = (products, targetName) => {
  const normalizedTarget = normalizeName(targetName);
  const exactMatch = products.find((product) => normalizeName(product.name) === normalizedTarget);

  if (exactMatch) {
    return exactMatch;
  }

  const containsMatch = products.find((product) =>
    normalizeName(product.name).includes(normalizedTarget)
  );

  return containsMatch || products[0] || null;
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { addCombo } = useCart();
  const [showcaseProducts, setShowcaseProducts] = useState([]);
  const [homepageError, setHomepageError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomepageProducts = async () => {
      try {
        const productResponses = await Promise.all(
          homepageShowcaseNames.map((name) =>
            getProducts({
              search: name,
              limit: 8,
            })
          )
        );

        const curatedProducts = productResponses
          .map((response, index) =>
            resolveShowcaseProduct(response.products || [], homepageShowcaseNames[index])
          )
          .filter(Boolean);

        setShowcaseProducts(curatedProducts);
        setHomepageError(
          curatedProducts.length ? "" : "Unable to load homepage showcase toys right now."
        );
      } catch (error) {
        setHomepageError(error.response?.data?.message || "Unable to refresh homepage toys.");
      } finally {
        setLoading(false);
      }
    };

    loadHomepageProducts();
  }, []);

  const bestSellerProducts = useMemo(() => showcaseProducts.slice(0, 4), [showcaseProducts]);
  const newArrivalProducts = useMemo(() => showcaseProducts.slice(4, 10), [showcaseProducts]);

  const handleComboCheckout = () => {
    trackStoreEvent({
      eventType: "hero_click",
      category: {
        categoryLabel: "Combo Offer",
      },
    }).catch(() => {});
    addCombo(viralToysCombo);
    navigate("/checkout");
  };

  return (
    <div className="page-stack app-homepage">
      <section className="hero-reference-card">
        <button type="button" className="hero-image-button" onClick={handleComboCheckout}>
          <img
            src="/assets/ui/hero-mobile-reference.png"
            alt="AI4Kids combo hero banner"
            className="hero-reference-image"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </button>
      </section>

      <TrustStrip />

      <section className="section-panel category-showcase-panel">
        <div className="rail-header">
          <h2>Shop by Category</h2>
          <Link to="/products">View All</Link>
        </div>

        <div className="category-showcase-grid">
          {homepageCategories.map((category) => (
            <Link
              key={category.label}
              to={category.to}
              className="category-showcase-card"
              onClick={() => {
                trackStoreEvent({
                  eventType: "category_click",
                  category: {
                    categoryLabel: category.label,
                  },
                }).catch(() => {});
              }}
            >
              <span className="category-icon-shell" aria-hidden="true">
                <img src={category.icon} alt="" className="category-icon-image" />
              </span>
              <strong>{category.label}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-panel home-rail-card">
        <div className="rail-header">
          <h2>Best Sellers</h2>
          <Link to="/products?featured=true">View All</Link>
        </div>

        {loading ? (
          <div className="home-product-grid" aria-label="Loading best seller toys">
            {Array.from({ length: 4 }, (_, index) => (
              <article key={index} className="product-card home-showcase-card placeholder-card">
                <div className="placeholder-image" />
                <div className="placeholder-line" />
                <div className="placeholder-line short" />
              </article>
            ))}
          </div>
        ) : (
          <div className="home-product-grid">
            {bestSellerProducts.map((product) => (
              <ProductCard
                key={product._id || product.slug || product.name}
                product={{
                  ...product,
                  shortDescription: buildProductBenefit(product),
                }}
                variant="home"
              />
            ))}
          </div>
        )}

        <p className="rail-footnote">COD Fee: Rs 40 per Product</p>
      </section>

      <section className="section-panel home-rail-card">
        <div className="rail-header">
          <h2>New Arrivals</h2>
          <Link to="/products?sort=latest">View All</Link>
        </div>

        {loading ? (
          <div className="home-product-grid" aria-label="Loading new arrival toys">
            {Array.from({ length: 6 }, (_, index) => (
              <article key={index} className="product-card home-showcase-card placeholder-card">
                <div className="placeholder-image" />
                <div className="placeholder-line" />
                <div className="placeholder-line short" />
              </article>
            ))}
          </div>
        ) : (
          <div className="home-product-grid">
            {newArrivalProducts.map((product) => (
              <ProductCard
                key={product._id || product.slug || product.name}
                product={{
                  ...product,
                  shortDescription: buildProductBenefit(product),
                }}
                variant="home"
              />
            ))}
          </div>
        )}
      </section>

      <section className="section-panel home-brand-banner">
        <div className="home-brand-banner-logo">
          <img src="/logo.png" alt="AI4Kids" />
        </div>

        <div className="home-brand-banner-copy">
          <strong>Creative Learning Toys</strong>
          <p>
            Screen-free smart play, curated toy discovery, and child-friendly mobile shopping for
            families across India.
          </p>
          <ul className="home-brand-points">
            <li>Creative Learning Toys</li>
            <li>Screen-Free Smart Play</li>
            <li>Safe & Child-Friendly</li>
          </ul>
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
