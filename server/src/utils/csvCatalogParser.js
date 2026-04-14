import { parse } from "csv-parse/sync";

const aliasMap = {
  product_name: "name",
  productname: "name",
  title: "name",
  image_url: "main_image",
  image: "main_image",
  mainimage: "main_image",
  saleprice: "sale_price",
  selling_price: "sale_price",
  price: "sale_price",
  mrpprice: "mrp",
  originalprice: "mrp",
  shortdescription: "short_description",
  short_description: "short_description",
  reviewcount: "review_count",
  review_count: "review_count",
  discountpercent: "discount_percent",
  discount_percent: "discount_percent",
  imageurl: "main_image",
};

const normalizeHeader = (header = "") =>
  String(header || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const parseCatalogCsv = (buffer) => {
  const rows = parse(buffer.toString("utf-8"), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_column_count: true,
    trim: true,
  });

  return rows.map((row) => {
    const normalizedRow = {};

    Object.entries(row || {}).forEach(([key, value]) => {
      const normalizedKey = normalizeHeader(key);
      normalizedRow[aliasMap[normalizedKey] || normalizedKey] = String(value || "").trim();
    });

    return normalizedRow;
  });
};
