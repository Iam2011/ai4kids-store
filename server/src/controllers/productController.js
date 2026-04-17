import { Product } from "../models/Product.js";
import {
  getCategoryMatchers,
  normalizeCategoryValue,
  normalizeProductRecord,
} from "../utils/productDerivation.js";

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildCategoryQuery = (category) => {
  if (!category) return null;

  const normalizedCategory = normalizeCategoryValue(String(category || ""), "");
  const categoryRegex = new RegExp(escapeRegex(normalizedCategory), "i");
  const matcherRegexes = Array.from(
    new Set(getCategoryMatchers(normalizedCategory).map((matcher) => new RegExp(escapeRegex(matcher), "i")))
  );

  return {
    $or: [
      { category: normalizedCategory },
      { rawCategory: categoryRegex },
      ...matcherRegexes.map((regex) => ({ name: regex })),
      ...matcherRegexes.map((regex) => ({ rawCategory: regex })),
    ],
  };
};

const buildProductQuery = ({ search, ageGroup, category, featured }) => {
  const query = { isActive: true };

  if (search) {
    query.$text = { $search: search };
  }

  if (ageGroup) {
    query.ageGroup = ageGroup;
  }

  if (category) {
    Object.assign(query, buildCategoryQuery(category));
  }

  if (featured === "true") {
    query.featured = true;
  }

  if (featured === "homeRail") {
    query.homeRailEligible = true;
  }

  return query;
};

const buildSort = (sortBy) => {
  switch (sortBy) {
    case "priceAsc":
      return { price: 1, featured: -1 };
    case "priceDesc":
      return { price: -1, featured: -1 };
    case "discount":
      return { discountPercent: -1, featured: -1 };
    case "latest":
      return { createdAt: -1 };
    default:
      return { featured: -1, limitedStock: -1, createdAt: -1 };
  }
};

export const getProducts = async (req, res) => {
  const { search, ageGroup, category, featured, sort, limit, homeRail } = req.query;
  const products = (
    await Product.find(
    {
      ...buildProductQuery({
        search,
        ageGroup,
        category,
        featured: homeRail === "true" ? "homeRail" : featured,
      }),
    }
  )
    .sort(buildSort(sort))
    .limit(Math.min(Number(limit) || 24, 100))
    .lean()
  ).map((product) => normalizeProductRecord(product));

  res.json({
    total: products.length,
    filters: {
      ageGroup: ageGroup || "",
      category: category || "",
      search: search || "",
      featured: featured || "",
      homeRail: homeRail || "",
      sort: sort || "featured",
    },
    products,
  });
};

export const getProductBySlug = async (req, res) => {
  const storedProduct = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  }).lean();

  if (!storedProduct) {
    return res.status(404).json({ message: "Product not found." });
  }

  const product = normalizeProductRecord(storedProduct);
  const relatedQuery = buildCategoryQuery(product.category);
  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    ...(relatedQuery || {}),
  })
    .sort({ featured: -1, discountPercent: -1 })
    .limit(4)
    .lean()
    .then((rows) => rows.map((row) => normalizeProductRecord(row)));

  res.json({ product, relatedProducts });
};
