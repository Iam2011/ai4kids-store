import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/storeApi.js";
import { AgeSection } from "../components/AgeSection.jsx";
import { FeaturedProducts } from "../components/FeaturedProducts.jsx";
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
    badge: "Viral",
    benefit: "Ride-on fun kids talk about.",
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
    badge: "Popular",
    benefit: "Fast-moving favorite for weekend gifting.",
  },
  {
    key: "hurricane-stunt-car",
    name: "2152B HURRICANE STUNT CAR METAL",
    displayName: "Hurricane Metal Stunt Car",
    aliases: ["HURRICANE STUNT CAR", "2152B HURRICANE"],
    price: 800,
    image: "https://cdn.quicksell.co/-OQIdzkXGxkY9q31SvxI/products_400/-Ooe6Eca2DuH7I6BSSl2.jpg",
    category: "Remote Toys",
    ageGroup: "6-8",
    badge: "Viral",
    benefit: "Action toy kids love for indoor races.",
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
    badge: "Popular",
    benefit: "Remote-control thrill with bold lights.",
  },
  {
    key: "garuda-scooty",
    name: "GARUDA SCOOTY WITH LED",
    displayName: "Garuda Scooty with LED",
    aliases: ["GARUDA SCOOTY"],
    price: 800,
    image: "https://cdn.quicksell.co/-OQIdzkXGxkY9q31SvxI/products_400/-OpqUNXJYojbJuW4p91j.jpg",
    category: "Outdoor",
    ageGroup: "3-5",
    badge: "Popular",
    benefit: "Great gift pick for first scooty rides.",
  },
  {
    key: "bubble-gun",
    name: "GSH818-36 BUBBLE GUN CHARGEABLE",
    displayName: "Bubble Gun Chargeable",
    aliases: ["BUBBLE GUN CHARGEABLE", "BUBBLE GUN"],
    price: 270,
    image: "https://cdn.quicksell.co/-OQIdzkXGxkY9q31SvxI/products_400/-OZEGXVty5IiAbP_L1Kq.jpg",
    category: "Kids Toys",
    ageGroup: "0-2",
    badge: "Budget",
    benefit: "Bubble burst play for little hands.",
  },
  {
    key: "goyo-stunt-car",
    name: "GY 2090-14 GOYO STUNT CAR",
    displayName: "Goyo Stunt Car",
    aliases: ["GOYO STUNT CAR", "GY 2090-14"],
    price: 220,
    image: "https://cdn.quicksell.co/-OQIdzkXGxkY9q31SvxI/products_400/-OociS2OK2t9y61xp4M7.jpg",
    category: "Remote Toys",
    ageGroup: "6-8",
    badge: "Budget",
    benefit: "Budget stunt pick with quick cart appeal.",
  },
  {
    key: "smoke-gatling-gun",
    name: "SMOKE GATLING GUN",
    displayName: "Smoke Gatling Gun",
    aliases: ["GATLING GUN", "SMOKE GATLING"],
    price: 340,
    image: "https://cdn.quicksell.co/-OQIdzkXGxkY9q31SvxI/products_400/-Oa9DJbElo24gy-91OYY.jpg",
    category: "Action Toys",
    ageGroup: "6-8",
    badge: "Viral",
    benefit: "Sound-and-action favorite for older kids.",
  },
];

const comboHeroAssets = {
  scooter: "/assets/hero/scooter.png",
  rcCar: "/assets/hero/rc-car.png",
  dartGun: "/assets/hero/dart-gun.png",
};

const comboTrustChips = [
  "Cash on Delivery",
  "Fast Confirmation",
  "Limited Stock",
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

  if (byImage) {
    return byImage;
  }

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

  const ageCards = [
    {
      age: "0-2",
      title: "Tiny hands, playful start",
      guidance: "Gentle bubble fun and sensory movement that feels safe and giftable.",
      cta: "Shop 0-2 picks",
      to: "/products?ageGroup=0-2",
      image: productMap["bubble-gun"]?.imageUrl,
      imageAlt: productMap["bubble-gun"]?.displayName || "Bubble toy",
      tone: "tone-bubble",
    },
    {
      age: "3-5",
      title: "Scooty joy for early riders",
      guidance: "Colorful ride-ons with lights and motion for playful daily use.",
      cta: "Shop 3-5 picks",
      to: "/products?ageGroup=3-5",
      image: productMap["garuda-scooty"]?.imageUrl,
      imageAlt: productMap["garuda-scooty"]?.displayName || "Scooty toy",
      tone: "tone-scooty",
    },
    {
      age: "6-8",
      title: "Remote action favorites",
      guidance: "Fast RC picks and stunt-ready toys that keep kids engaged longer.",
      cta: "Shop 6-8 picks",
      to: "/products?ageGroup=6-8",
      image: productMap["hurricane-stunt-car"]?.imageUrl,
      imageAlt: productMap["hurricane-stunt-car"]?.displayName || "RC car toy",
      tone: "tone-rc",
    },
    {
      age: "9+",
      title: "Big thrills, bold gifting",
      guidance: "Premium scooters and stunt toys for older kids who want more speed.",
      cta: "Shop 9+ picks",
      to: "/products?ageGroup=9%2B",
      image: productMap["t22-scooter"]?.imageUrl,
      imageAlt: productMap["t22-scooter"]?.displayName || "Scooter toy",
      tone: "tone-scooter",
    },
  ];

  const featuredOrder = [
    "t22-scooter",
    "611-scooter",
    "hurricane-stunt-car",
    "robot-rc-car",
    "garuda-scooty",
    "bubble-gun",
    "goyo-stunt-car",
    "smoke-gatling-gun",
  ];

  const featuredProducts = featuredOrder
    .map((productKey) => productMap[productKey])
    .filter(Boolean);

  const handleComboCheckout = () => {
    addCombo(viralToysCombo);
    navigate("/checkout");
  };

  return (
    <div className="page-stack">
      <section className="hero-section combo-hero">
        <div className="hero-copy combo-hero-copy">
          <span className="combo-badge">3 Viral Toys Combo</span>
          <h1>Best Toys for Your Kids</h1>
          <p>
            Scooter + RC Car + Dart Gun in one exciting combo.
            <br />
            A premium gift combo built to wow kids instantly.
          </p>

          <div className="combo-price-wrap" aria-live="polite">
            <div className="combo-price-line">
              <span className="combo-old-price">MRP Rs 6000</span>
            </div>
            <strong className="combo-new-price">Now Rs 3999</strong>
            <span className="combo-save-chip">Save Rs 2001</span>
          </div>

          <div className="combo-cta-group">
            <button
              type="button"
              className="primary-button combo-order-cta"
              onClick={handleComboCheckout}
            >
              Order Combo Now
            </button>
            <p className="combo-cod-note">COD Available</p>
          </div>

          <div className="combo-trust-list">
            {comboTrustChips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
        </div>

        <div className="combo-stage" aria-label="Combo toys included">
          <figure className="combo-product combo-product-scooter">
            <img
              src={comboHeroAssets.scooter}
              alt="Light and music scooter"
              className="combo-image combo-image-scooter"
              loading="eager"
            />
          </figure>

          <figure className="combo-product combo-product-gun">
            <img
              src={comboHeroAssets.dartGun}
              alt="Super dart gun"
              className="combo-image combo-image-gun"
              loading="eager"
            />
          </figure>

          <figure className="combo-product combo-product-rc">
            <img
              src={comboHeroAssets.rcCar}
              alt="RC rock climber car"
              className="combo-image combo-image-rc"
              loading="eager"
            />
          </figure>
        </div>
      </section>

      <TrustStrip />
      <AgeSection cards={ageCards} />
      <FeaturedProducts products={featuredProducts} loading={loading} />
      {homepageError ? (
        <section className="section-panel">
          <p className="helper-text">{homepageError}</p>
        </section>
      ) : null}
    </div>
  );
};
