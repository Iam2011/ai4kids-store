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

  return featuredBoost + discountPercent * 4 + rating * 18 + clamp(reviewCount, 0, 500);
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

  return `${product.category || "Kids"} favorite with strong gifting appeal.`;
};
