import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../api/storeApi.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { TrustStrip } from "../components/TrustStrip.jsx";
import { useCart } from "../context/CartContext.jsx";
import { viralToysCombo } from "../constants/comboOffer.js";

const curatedProducts = [
  {
    key: "t22-scooter",
    name: "T22 SCOOTER LIGHT MUSIC SENSOR",
    displayName: "T22 Light & Music Scooter",
    aliases: ["T22 SCOOTER", "LIGHT MUSIC SCOOTER"],
    price: 1650,
    image: "https://cdn.quicksell.co/-OQIdzkXGxkY9q31SvxI/products_400/-OkSHXEuOIEo4_peZmC8.jpg",
    category: "Outdoor",
    ageGroup: "9+",
    badge: "NEW",
    benefit: "Ride-on favorite for gifting and fast checkout.",
  },
  {
    key: "611-scooter",
    name: "611 SCOOTER",
    displayName: "611 Scooter",
    aliases: ["611 SCOOTER"],
    price: 1350,
    image: "https://cdn.quicksell.co/-OQIdzkXGxkY9q31SvxI/products_400/-OkSHgFIVUrNYaSsFzb6.jpg",
    category: "Outdoor",
    ageGroup: "6-8",
    badge: "NEW",
    benefit: "Stable scooter pick for active kids.",
  },
  {
    key: "hurricane-stunt-car",
    name: "2152B HURRICANE STUNT CAR METAL",
    displayName: "RC Monster Truck",
    aliases: ["HURRICANE STUNT CAR", "2152B HURRICANE"],
    price: 800,
    image: "https://cdn.quicksell.co/-OQIdzkXGxkY9q31SvxI/products_400/-Ooe6Eca2DuH7I6BSSl2.jpg",
    category: "Remote Toys",
    ageGroup: "6-8",
    badge: "35%",
    benefit: "High-speed RC fun kids instantly notice.",
  },
  {
    key: "robot-rc-car",
    name: "806-103 ROBOT RC CAR",
    displayName: "Robot RC Car",
    aliases: ["ROBOT RC CAR"],
    price: 750,
    image: "https://cdn.quicksell.co/-OQIdzkXGxkY9q31SvxI/products_400/-Ooe7BXwJA1SZsMih9jN.jpg",
    category: "Remote Toys",
    ageGroup: "6-8",
    badge: "NEW",
    benefit: "Remote-control pick with gifting appeal.",
  },
  {
    key: "garuda-scooty",
    name: "GARUDA SCOOTY WITH LED",
    displayName: "Garuda Scooty",
    aliases: ["GARUDA SCOOTY"],
    price: 800,
    image: "https://cdn.quicksell.co/-OQIdzkXGxkY9q31SvxI/products_400/-OpqUNXJYojbJuW4p91j.jpg",
    category: "Outdoor",
    ageGroup: "3-5",
    badge: "NEW",
    benefit: "Easy ride-on pick for younger kids.",
  },
  {
    key: "bubble-gun",
    name: "GSH818-36 BUBBLE GUN CHARGEABLE",
    displayName: "Laser Battle Gun",
    aliases: ["BUBBLE GUN CHARGEABLE", "BUBBLE GUN"],
    price: 270,
    image: "https://cdn.quicksell.co/-OQIdzkXGxkY9q31SvxI/products_400/-OZEGXVty5IiAbP_L1Kq.jpg",
    category: "Kids Toys",
    ageGroup: "0-2",
    badge: "NEW",
    benefit: "Popular low-ticket action toy.",
  },
  {
    key: "goyo-stunt-car",
    name: "GY 2090-14 GOYO STUNT CAR",
    displayName: "Talking Owl",
    aliases: ["GOYO STUNT CAR", "GY 2090-14"],
    price: 220,
    image: "https://cdn.quicksell.co/-OQIdzkXGxkY9q31SvxI/products_400/-OociS2OK2t9y61xp4M7.jpg",
    category: "Remote Toys",
    ageGroup: "6-8",
    badge: "NEW",
    benefit: "Fast-moving value toy for quick checkout.",
  },
  {
    key: "smoke-gatling-gun",
    name: "SMOKE GATLING GUN",
    displayName: "Magical Unicorn",
    aliases: ["GATLING GUN", "SMOKE GATLING"],
    price: 340,
    image: "https://cdn.quicksell.co/-OQIdzkXGxkY9q31SvxI/products_400/-Oa9DJbElo24gy-91OYY.jpg",
    category: "Action Toys",
    ageGroup: "6-8",
    badge: "NEW",
    benefit: "Action favorite with strong shelf appeal.",
  },
];

const searchTabs = ["Categories", "Chips", "Stores", "Budgets", "Feeds"];
const browseChips = [
  { label: "Cars", to: "/products?category=Remote%20Toys" },
  { label: "Blasters", to: "/products?category=Action%20Toys" },
  { label: "Scooters", to: "/products?category=Outdoor" },
  { label: "Robots", to: "/products?search=robot" },
];

const reviewCards = [
  {
    name: "Neha S.",
    title: "Verified Buyer",
    copy: "Amazing toy picks and a premium mobile shopping feel. The combo section made gifting really easy.",
  },
];

const normalizeName = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getFallbackOriginalPrice = (price) => Math.ceil((price * 1.2) / 50) * 50;

const buildHomepageProduct = (curatedItem, matchedProduct) => {
  const fallbackOriginalPrice = getFallbackOriginalPrice(curatedItem.price);
  const resolvedPrice = matchedProduct?.price ?? curatedItem.price;
  const resolvedOriginalPrice = matchedProduct?.originalPrice ?? fallbackOriginalPrice;
  const resolvedDiscount =
    matchedProduct?.discountPercent ??
    Math.max(10, Math.round(((resolvedOriginalPrice - resolvedPrice) / resolvedOriginalPrice) * 100));

  return {
    ...matchedProduct,
    key: curatedItem.key,
    name: matchedProduct?.name || curatedItem.name,
    displayName: curatedItem.displayName,
    imageUrl: matchedProduct?.imageUrl || curatedItem.image,
    price: resolvedPrice,
    originalPrice: resolvedOriginalPrice,
    discountPercent: resolvedDiscount,
    category: curatedItem.category,
    ageGroup: curatedItem.ageGroup,
    badge: curatedItem.badge,
    benefit: curatedItem.benefit,
    shortDescription: curatedItem.benefit,
  };
};

const findCuratedMatch = (curatedItem, products) => {
  const byImage = products.find((product) => product.imageUrl === curatedItem.image);
  if (byImage) return byImage;

  const aliases = [curatedItem.name, ...curatedItem.aliases].map(normalizeName);

  return products.find((product) => {
    const normalizedName = normalizeName(product.name);
    return aliases.some(
      (alias) => normalizedName.includes(alias) || alias.includes(normalizedName)
    );
  });
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { addCombo } = useCart();
  const [homepageProducts, setHomepageProducts] = useState(
    curatedProducts.map((product) => buildHomepageProduct(product, null))
  );
  const [loading, setLoading] = useState(true);
  const [homepageError, setHomepageError] = useState("");

  useEffect(() => {
    const loadHomepageProducts = async () => {
      try {
        const data = await getProducts({ limit: 200, sort: "featured" });
        const allProducts = data.products || [];
        setHomepageProducts(
          curatedProducts.map((product) =>
            buildHomepageProduct(product, findCuratedMatch(product, allProducts))
          )
        );
        setHomepageError("");
      } catch (error) {
        setHomepageError(error.response?.data?.message || "Unable to refresh homepage toys.");
      } finally {
        setLoading(false);
      }
    };

    loadHomepageProducts();
  }, []);

  const productMap = homepageProducts.reduce((accumulator, product) => {
    accumulator[product.key] = product;
    return accumulator;
  }, {});

  const featuredProducts = ["robot-rc-car", "hurricane-stunt-car", "bubble-gun"]
    .map((key) => productMap[key])
    .filter(Boolean);

  const newArrivalProducts = ["goyo-stunt-car", "611-scooter", "bubble-gun", "smoke-gatling-gun"]
    .map((key) => productMap[key])
    .filter(Boolean);

  const handleComboCheckout = () => {
    addCombo(viralToysCombo);
    navigate("/checkout");
  };

  return (
    <div className="page-stack app-homepage">
      <section className="section-panel search-panel">
        <button type="button" className="search-bar-prompt reference-search" onClick={() => navigate("/products")}>
          <span>Search for toys...</span>
        </button>

        <div className="home-filter-row">
          <button type="button" className="category-dropdown-pill" onClick={() => navigate("/products")}>
            All Categories
          </button>
        </div>
      </section>

      <section className="hero-reference-card">
        <button type="button" className="hero-image-button" onClick={handleComboCheckout}>
          <img src="/assets/ui/hero-banner.png" alt="AI4Kids combo hero banner" className="hero-reference-image" />
        </button>
      </section>

      <TrustStrip />

      <section className="section-panel home-tabs-panel">
        <div className="home-tabs-row">
          {searchTabs.map((tab, index) => (
            <button key={tab} type="button" className={`home-tab ${index === 0 ? "active" : ""}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="browse-pill-row app-chip-row">
          {browseChips.map((chip) => (
            <Link key={chip.label} to={chip.to} className="app-browse-chip">
              {chip.label}
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
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.key}
                product={product}
                variant="mini"
                badgeOverride={product.badge}
                nameOverride={product.displayName}
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
          {newArrivalProducts.map((product) => (
            <ProductCard
              key={product.key}
              product={product}
              variant="mini"
              badgeOverride={product.badge}
              nameOverride={product.displayName}
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
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
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
