import { Product } from "../models/Product.js";

const buildProductQuery = ({ search, ageGroup, category, featured }) => {
  const query = { isActive: true };

  if (search) {
    query.$text = { $search: search };
  }

  if (ageGroup) {
    query.ageGroup = ageGroup;
  }

  if (category) {
    query.category = category;
  }

  if (featured === "true") {
    query.featured = true;
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
  const { search, ageGroup, category, featured, sort, limit } = req.query;
  const products = await Product.find(
    buildProductQuery({ search, ageGroup, category, featured })
  )
    .sort(buildSort(sort))
    .limit(Math.min(Number(limit) || 24, 100))
    .lean();

  res.json({
    total: products.length,
    filters: {
      ageGroup: ageGroup || "",
      category: category || "",
      search: search || "",
      featured: featured || "",
      sort: sort || "featured",
    },
    products,
  });
};

export const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).lean();

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true,
  })
    .sort({ featured: -1, discountPercent: -1 })
    .limit(4)
    .lean();

  res.json({ product, relatedProducts });
};
