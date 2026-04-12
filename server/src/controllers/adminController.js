import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { slugify } from "../utils/slugify.js";

const signAdminToken = (admin) =>
  jwt.sign(
    {
      sub: admin._id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const toBoolean = (value, defaultValue = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }

  return defaultValue;
};

const normalizeProductPayload = (payload) => {
  const name = String(payload.name || "").trim();
  const sku = String(payload.sku || "").trim();

  return {
    sku,
    name,
    slug: String(payload.slug || slugify(name)).trim(),
    price: Number(payload.price),
    originalPrice: Number(payload.originalPrice),
    discountPercent: Number(payload.discountPercent),
    imageUrl: String(payload.imageUrl || "").trim(),
    gallery: Array.isArray(payload.gallery)
      ? payload.gallery.filter(Boolean)
      : String(payload.gallery || payload.imageUrl || "")
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
    videoUrl: String(payload.videoUrl || "").trim(),
    description: String(payload.description || "").trim(),
    shortDescription: String(payload.shortDescription || "").trim(),
    category: payload.category,
    subCategory: String(payload.subCategory || "").trim(),
    ageGroup: payload.ageGroup,
    moq: Number(payload.moq || 1),
    stockCount: Number(payload.stockCount || 0),
    limitedStock: toBoolean(payload.limitedStock, false),
    badge: String(payload.badge || "").trim(),
    featured: toBoolean(payload.featured, false),
    tags: Array.isArray(payload.tags)
      ? payload.tags.filter(Boolean)
      : String(payload.tags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
    isActive: toBoolean(payload.isActive, true),
  };
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  const admin = await Admin.findOne({ email: String(email || "").toLowerCase(), active: true });

  if (!admin) {
    return res.status(401).json({ message: "Invalid admin credentials." });
  }

  const passwordMatches = await bcrypt.compare(String(password || ""), admin.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid admin credentials." });
  }

  res.json({
    token: signAdminToken(admin),
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
};

export const getAdminSummary = async (req, res) => {
  const [productCount, orderCount, pendingOrders, revenueData] = await Promise.all([
    Product.countDocuments({}),
    Order.countDocuments({}),
    Order.countDocuments({ orderStatus: { $in: ["pending", "confirmed"] } }),
    Order.aggregate([
      { $match: { paymentStatus: { $in: ["paid", "deposit_paid"] } } },
      { $group: { _id: null, revenue: { $sum: "$paymentAmount" } } },
    ]),
  ]);

  res.json({
    metrics: {
      productCount,
      orderCount,
      pendingOrders,
      capturedRevenue: revenueData[0]?.revenue || 0,
    },
  });
};

export const getAdminProducts = async (req, res) => {
  const products = await Product.find({}).sort({ updatedAt: -1 }).lean();
  res.json({ products });
};

export const createAdminProduct = async (req, res) => {
  const product = await Product.create(normalizeProductPayload(req.body));
  res.status(201).json({ product });
};

export const updateAdminProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, normalizeProductPayload(req.body), {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  res.json({ product });
};

export const getAdminOrders = async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
  res.json({ orders });
};
