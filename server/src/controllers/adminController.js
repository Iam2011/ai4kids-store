import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { buildAnalyticsReport } from "../services/analyticsReportService.js";
import { buildCsv, buildExcelXmlWorkbook } from "../utils/excelExport.js";
import { parseCatalogCsv } from "../utils/csvCatalogParser.js";
import { slugify } from "../utils/slugify.js";
import { parseCatalogWorkbook } from "../utils/xlsxCatalogParser.js";
import {
  normalizeCategoryValue,
  normalizeProductTitle,
  transformCatalogRow,
} from "../utils/productDerivation.js";

const confirmedOrderStatuses = ["confirmed", "processing", "shipped", "delivered"];

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
  const name = normalizeProductTitle(payload.name || "");
  const sku = String(payload.sku || "").trim();
  const price = Number(payload.price);
  const originalPrice = Number(payload.originalPrice);
  const discountPercent = Number(payload.discountPercent);
  const rating = Number(payload.rating || 4.5);
  const reviewCount = Number(payload.reviewCount || 0);
  const rawCategory = String(payload.rawCategory || payload.category || "").trim();
  const category = normalizeCategoryValue(rawCategory, name);
  const features = Array.isArray(payload.features)
    ? payload.features.filter(Boolean)
    : String(payload.features || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);

  return {
    sku,
    name,
    slug: String(payload.slug || slugify(name)).trim(),
    price,
    originalPrice: Number.isFinite(originalPrice) && originalPrice >= price ? originalPrice : price,
    discountPercent,
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
    category,
    rawCategory,
    subCategory: String(payload.subCategory || rawCategory || category).trim(),
    ageGroup: payload.ageGroup,
    moq: Number(payload.moq || 1),
    stockCount: Number(payload.stockCount || 0),
    limitedStock: toBoolean(payload.limitedStock, false),
    badge: String(payload.badge || "").trim(),
    featured: toBoolean(payload.featured, false),
    features,
    tags: Array.isArray(payload.tags)
      ? payload.tags.filter(Boolean)
      : String(payload.tags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
    rating,
    reviewCount,
    isActive: toBoolean(payload.isActive, true),
  };
};

const buildOrderExportRows = (orders) =>
  orders.map((order) => ({
    mongoOrderId: String(order._id),
    orderNumber: order.orderNumber,
    createdAt: new Date(order.createdAt).toLocaleString("en-IN"),
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentMode: order.paymentMode,
    customerName: order.customer?.name || "",
    customerMobile: order.customer?.mobile || "",
    customerAddress: order.customer?.address || "",
    customerCity: order.customer?.city || "",
    customerState: order.customer?.state || "",
    customerPincode: order.customer?.pincode || "",
    subtotal: order.subtotal || 0,
    discountAmount: order.discountAmount || 0,
    totalAmount: order.totalAmount || 0,
    codConfirmationFee: order.codConfirmationFee || 0,
    paidNow: order.paymentAmount || 0,
    balanceDue: order.balanceDue || 0,
    itemSummary: (order.items || [])
      .map((item) =>
        item.itemType === "combo"
          ? `${item.name} x${item.quantity} [${(item.bundleItems || [])
              .map((bundleItem) => bundleItem.name)
              .join(" + ")}]`
          : `${item.name} x${item.quantity}`
      )
      .join(" | "),
  }));

const parseCatalogUploadRows = async (buffer, filename) => {
  const lowerName = String(filename || "").toLowerCase();

  if (lowerName.endsWith(".csv")) {
    return parseCatalogCsv(buffer);
  }

  if (lowerName.endsWith(".xlsx")) {
    const tempPath = path.join(os.tmpdir(), `ai4kids-upload-${Date.now()}.xlsx`);
    await fs.writeFile(tempPath, buffer);

    try {
      return await parseCatalogWorkbook(tempPath);
    } finally {
      await fs.unlink(tempPath).catch(() => {});
    }
  }

  throw new Error("Only .xlsx and .csv files are supported.");
};

const buildImportCatalogSource = (filename) =>
  `admin_upload:${slugify(path.basename(filename, path.extname(filename)) || "catalog")}:${Date.now()}`;

const ensureUniqueSlug = (desiredSlug, usedSlugs, currentSlug = "") => {
  const baseSlug = slugify(desiredSlug || "product");

  if (currentSlug && currentSlug === baseSlug) {
    usedSlugs.add(currentSlug);
    return currentSlug;
  }

  let nextSlug = baseSlug;
  let counter = 2;

  while (usedSlugs.has(nextSlug) && nextSlug !== currentSlug) {
    nextSlug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  usedSlugs.add(nextSlug);
  return nextSlug;
};

const buildDeviceType = (userAgent = "") => {
  const normalized = String(userAgent || "").toLowerCase();

  if (/(ipad|tablet)/.test(normalized)) return "tablet";
  if (/(mobile|android|iphone)/.test(normalized)) return "mobile";
  if (!normalized) return "unknown";
  return "desktop";
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

export const importAdminProducts = async (req, res) => {
  const filename = String(req.headers["x-upload-filename"] || "").trim();

  if (!filename) {
    return res.status(400).json({ message: "Upload filename is required." });
  }

  if (!Buffer.isBuffer(req.body) || !req.body.length) {
    return res.status(400).json({ message: "Upload file is empty." });
  }

  const rows = await parseCatalogUploadRows(req.body, filename);
  const existingProducts = await Product.find({}, { sku: 1, slug: 1 }).lean();
  const existingBySku = new Map(existingProducts.map((product) => [product.sku, product]));
  const usedSlugs = new Set(existingProducts.map((product) => product.slug).filter(Boolean));
  const catalogSource = buildImportCatalogSource(filename);
  const operations = [];
  const errors = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;

  rows.forEach((row, index) => {
    const name = String(row.name || "").trim();
    const sku = String(row.sku || "").trim();
    const imageUrl = String(row.main_image || row.image1 || row.imageUrl || "").trim();
    const salePrice = String(row.sale_price || row.price || "").trim();

    if (!name || !sku || !imageUrl || !salePrice) {
      skipped += 1;
      errors.push({
        row: index + 2,
        message: "Missing required name, SKU, image, or sale price.",
      });
      return;
    }

    const transformed = transformCatalogRow(
      {
        ...row,
        sale_price: salePrice,
        main_image: imageUrl,
      },
      index,
      catalogSource
    );
    const existing = existingBySku.get(transformed.sku);
    const nextSlug = ensureUniqueSlug(
      transformed.slug || transformed.name,
      usedSlugs,
      existing?.slug || ""
    );
    const payload = {
      ...transformed,
      slug: nextSlug,
      catalogSource,
    };

    if (existing) {
      updated += 1;
      operations.push({
        updateOne: {
          filter: { sku: transformed.sku },
          update: { $set: payload },
          upsert: false,
        },
      });
    } else {
      created += 1;
      operations.push({
        insertOne: {
          document: payload,
        },
      });
    }
  });

  if (operations.length) {
    await Product.bulkWrite(operations, { ordered: false });
  }

  res.json({
    summary: {
      filename,
      created,
      updated,
      skipped,
      failed: errors.length,
      totalRows: rows.length,
    },
    errors: errors.slice(0, 20),
  });
};

export const getAdminOrders = async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
  res.json({ orders });
};

export const exportAdminOrdersCsv = async (req, res) => {
  const orders = await Order.find({
    orderStatus: { $in: confirmedOrderStatuses },
  })
    .sort({ createdAt: -1 })
    .lean();
  const csv = buildCsv(buildOrderExportRows(orders));

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="ai4kids-confirmed-orders.csv"');
  res.send(csv);
};

export const exportAdminOrdersExcel = async (req, res) => {
  const orders = await Order.find({
    orderStatus: { $in: confirmedOrderStatuses },
  })
    .sort({ createdAt: -1 })
    .lean();
  const workbook = buildExcelXmlWorkbook(buildOrderExportRows(orders), "Confirmed Orders");

  res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="ai4kids-confirmed-orders.xls"');
  res.send(workbook);
};

export const getAdminVisitAnalytics = async (req, res) => {
  const report = await buildAnalyticsReport({
    range: req.query.range,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  });

  res.json(report);
};
