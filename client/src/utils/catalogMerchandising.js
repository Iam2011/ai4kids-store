const safeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

const getRankScore = (product) => {
  const discountPercent = safeNumber(product.discountPercent);
  const rating = safeNumber(product.rating, 4.2);
  const reviewCount = safeNumber(product.reviewCount);
  const featuredBoost = product.featured ? 35 : 0;
  const limitedPenalty = product.limitedStock ? -5 : 0;

  return featuredBoost + discountPercent * 4 + rating * 18 + clamp(reviewCount, 0, 500) + limitedPenalty;
};

const getVisualScore = (product) => {
  const galleryCount = Array.isArray(product.gallery) ? product.gallery.length : 0;
  const hasImage = product.imageUrl ? 20 : 0;
  return hasImage + galleryCount * 8 + getRankScore(product);
};

export const selectBestSellerProducts = (products, count = 3) =>
  [...products]
    .sort((left, right) => getRankScore(right) - getRankScore(left))
    .slice(0, count);

export const selectNewArrivalProducts = (products, count = 4) =>
  [...products]
    .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
    .slice(0, count);

export const selectTrendingProducts = (products, count = 4) =>
  [...products]
    .sort((left, right) => getVisualScore(right) - getVisualScore(left))
    .slice(0, count);

export const getHeroSupportCopy = (products) => {
  const topProducts = selectTrendingProducts(products, 3);
  const categoryLabels = Array.from(
    new Set(topProducts.map((product) => product.category).filter(Boolean))
  ).slice(0, 3);

  return {
    highlight: topProducts[0]?.name || "Trending kids toys",
    categories: categoryLabels,
  };
};

export const buildProductBenefit = (product) => {
  if (product.shortDescription) return product.shortDescription;

  if (Array.isArray(product.features) && product.features.length) {
    return product.features.slice(0, 3).join(" • ");
  }

  const name = String(product.name || "").toLowerCase();
  const category = String(product.category || "");

  if (name.includes("drone")) return "Flying fun for outdoor playtime.";
  if (name.includes("scooter")) return "A fun ride-on pick kids love.";
  if (name.includes("magnetic") || name.includes("mind craft") || name.includes("mindcraft")) {
    return "Hands-on STEM play for creative learning.";
  }
  if (name.includes("princess") || name.includes("doll house") || name.includes("dollhouse")) {
    return "Imaginative role-play fun for kids.";
  }
  if (name.includes("gun") || name.includes("blaster") || name.includes("thunder strike")) {
    return "Action-packed playtime blaster fun.";
  }
  if (
    name.includes("rc") ||
    name.includes("remote") ||
    name.includes("stunt") ||
    name.includes("rock car")
  ) {
    return "Remote-control fun for indoor and outdoor play.";
  }

  if (category === "Remote Control Toys") return "Remote-control fun kids love.";
  if (category === "Gun & Blasters") return "Action play made for gifting.";
  if (category === "Educational & Learning Toys") return "Smart play for growing minds.";
  if (category === "Games & Indoor Toys") return "Fast-paced fun for family time.";
  if (category === "Dolls & Soft Toys") return "Cute companions for imaginative play.";
  if (category === "Role Play & Kitchen Toys") return "Role-play sets for creative fun.";
  if (category === "Outdoor & Sports Toys") return "Active play made for outdoors.";

  return "A fun gift pick kids love.";
};
