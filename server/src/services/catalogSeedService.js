import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { Coupon } from "../models/Coupon.js";
import { Product } from "../models/Product.js";
import { ensureDefaultAdmin } from "./defaultAdminService.js";
import { transformCatalogRow } from "../utils/productDerivation.js";

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
  const configuredPath = process.env.CATALOG_CSV_PATH || "./data/SUPERKIDS_FINAL_CLEAN.csv";
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(__dirname, "../../", configuredPath);
};

export const seedCatalog = async ({ onlyIfEmpty = false } = {}) => {
  const existingProductCount = await Product.countDocuments({});

  if (onlyIfEmpty && existingProductCount > 0) {
    return {
      skipped: true,
      productCount: existingProductCount,
      couponCount: await Coupon.countDocuments({}),
      malformedRows: 0,
    };
  }

  const csvContent = readFileSync(resolveCatalogPath(), "utf-8");
  const rows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });
  const validRows = rows.filter((row) => row.product_name && row.price && row.image_url);
  const products = validRows.map((row, index) => transformCatalogRow(row, index));

  await Product.bulkWrite(
    products.map((product) => ({
      updateOne: {
        filter: { slug: product.slug },
        update: { $set: product },
        upsert: true,
      },
    }))
  );

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
