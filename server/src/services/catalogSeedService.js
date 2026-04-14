import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Coupon } from "../models/Coupon.js";
import { Product } from "../models/Product.js";
import { ensureDefaultAdmin } from "./defaultAdminService.js";
import { getCatalogSource, transformCatalogRow } from "../utils/productDerivation.js";
import { slugify } from "../utils/slugify.js";
import { parseCatalogWorkbook } from "../utils/xlsxCatalogParser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultCoupons = [
  {
    code: "KIDS25",
    description: "25% off on orders above Rs 499",
    type: "percent",
    value: 25,
    minOrderAmount: 499,
    maxDiscount: 999,
    allowOnCod: true,
    allowOnFull: true,
    active: true,
  },
  {
    code: "PLAYMORE",
    description: "Rs 100 off on full prepaid orders above Rs 999",
    type: "fixed",
    value: 100,
    minOrderAmount: 999,
    allowOnCod: false,
    allowOnFull: true,
    active: true,
  },
];

const resolveCatalogPath = () => {
  const configuredPath =
    process.env.CATALOG_XLSX_PATH ||
    (String(process.env.CATALOG_CSV_PATH || "").toLowerCase().endsWith(".xlsx")
      ? process.env.CATALOG_CSV_PATH
      : "") ||
    "./data/AI4Kids_website.xlsx";
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(__dirname, "../../", configuredPath);
};

const buildCatalogSignature = async (catalogPath) => {
  const stats = await fs.stat(catalogPath);
  return `${path.basename(catalogPath)}:${stats.size}:${Math.floor(stats.mtimeMs)}`;
};

const createUniqueSlug = (input, usedSlugs, fallbackIndex) => {
  const baseSlug = slugify(input || `product-${fallbackIndex + 1}`);
  let candidate = baseSlug;
  let counter = 2;

  while (usedSlugs.has(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  usedSlugs.add(candidate);
  return candidate;
};

const normalizeRows = (rows, catalogSource) => {
  const usedSlugs = new Set();

  return rows.map((row, index) => {
    const transformed = transformCatalogRow(row, index, catalogSource);
    return {
      ...transformed,
      slug: createUniqueSlug(transformed.slug || transformed.name, usedSlugs, index),
    };
  });
};

export const seedCatalog = async ({ onlyIfEmpty = false } = {}) => {
  const catalogPath = resolveCatalogPath();
  const catalogSource = getCatalogSource(await buildCatalogSignature(catalogPath));
  const existingProductCount = await Product.countDocuments({});
  const hasCurrentSource =
    existingProductCount > 0 &&
    (await Product.countDocuments({ catalogSource })) === existingProductCount;

  if (onlyIfEmpty && existingProductCount > 0 && hasCurrentSource) {
    return {
      skipped: true,
      productCount: existingProductCount,
      couponCount: await Coupon.countDocuments({}),
      malformedRows: 0,
    };
  }

  const rows = await parseCatalogWorkbook(catalogPath);
  const validRows = rows.filter(
    (row) =>
      row.name &&
      row.slug &&
      row.sku &&
      (row.main_image || row.image1) &&
      row.sale_price
  );
  const products = normalizeRows(validRows, catalogSource);

  await Product.deleteMany({});

  if (products.length) {
    await Product.insertMany(products, { ordered: true });
  }

  for (const coupon of defaultCoupons) {
    await Coupon.findOneAndUpdate({ code: coupon.code }, coupon, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  await ensureDefaultAdmin();

  return {
    skipped: false,
    productCount: products.length,
    couponCount: defaultCoupons.length,
    malformedRows: rows.length - validRows.length,
  };
};
