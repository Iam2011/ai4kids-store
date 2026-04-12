import { slugify } from "./slugify.js";

const keywordGroups = {
  "Board Games": ["game", "board", "puzzle", "cube", "card", "ludo", "chess", "stack", "block"],
  "Remote Toys": ["remote", "rc", "drone", "car", "truck", "bus", "plane", "fighter", "train", "bike", "robot"],
  Educational: ["phone", "learn", "math", "doctor", "kitchen", "music", "animal", "farm", "flash", "funny"],
  Outdoor: ["gun", "blaster", "ball", "bubble", "sport", "bat", "racket", "bow", "water", "outdoor"],
};

const subCategoryMatchers = [
  { label: "Vehicles", words: ["car", "truck", "plane", "fighter", "bike", "train", "bus", "robot"] },
  { label: "Games & Puzzles", words: ["game", "puzzle", "cube", "ludo", "chess", "block", "stack"] },
  { label: "Learning & Music", words: ["phone", "music", "flash", "doctor", "farm", "funny"] },
  { label: "Action Play", words: ["gun", "blaster", "strike", "smoke"] },
  { label: "Outdoor Fun", words: ["ball", "bubble", "bat", "racket", "bow"] },
];

const ageKeywords = {
  "0-2": ["baby", "toddler", "rattle", "duck", "push", "animal", "phone", "veggie", "funny"],
  "3-5": ["dinosaur", "jack", "musical", "car", "farm", "robot", "monster", "plane", "flash"],
  "6-8": ["gun", "blaster", "fighter", "smoke", "thunder", "police", "militry", "military"],
  "9+": ["puzzle", "chess", "strategy", "cube", "board", "science", "lab"],
};

const hashText = (value) =>
  Array.from(value).reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 1),
    0
  );

const parseRupee = (value) => Number(String(value || "").replace(/[^\d.]/g, "")) || 0;

const determineCategory = (name, price) => {
  const normalized = name.toLowerCase();

  for (const [label, words] of Object.entries(keywordGroups)) {
    if (words.some((word) => normalized.includes(word))) {
      return label;
    }
  }

  return price <= 90 ? "Educational" : "Outdoor";
};

const determineSubCategory = (name, category) => {
  const normalized = name.toLowerCase();
  const match = subCategoryMatchers.find(({ words }) =>
    words.some((word) => normalized.includes(word))
  );
  return match?.label || category;
};

const determineAgeGroup = (name, price) => {
  const normalized = name.toLowerCase();

  for (const [label, words] of Object.entries(ageKeywords)) {
    if (words.some((word) => normalized.includes(word))) {
      return label;
    }
  }

  if (price <= 70) return "0-2";
  if (price <= 150) return "3-5";
  if (price <= 350) return "6-8";
  return "9+";
};

const determineMOQ = (name) => {
  const exactPieces = name.match(/(\d+)\s*PC/i);
  if (exactPieces) return Number(exactPieces[1]);
  if (name.toLowerCase().includes("bulk")) return 4;
  return 1;
};

const determineDiscount = (name) => {
  const discountBands = [10, 12, 15, 18, 20, 25, 30];
  return discountBands[hashText(name) % discountBands.length];
};

const determineStock = (name, index) => ((hashText(name) + index * 11) % 18) + 4;

const buildDescription = ({ name, ageGroup, category, subCategory }) =>
  `${name} is a fast-moving ${subCategory.toLowerCase()} toy curated for kids aged ${ageGroup}. It sits inside our ${category.toLowerCase()} collection to keep mobile shoppers focused on high-value best sellers.`;

const buildTags = ({ name, category, ageGroup, subCategory }) =>
  Array.from(
    new Set(
      [name, category, subCategory, ageGroup]
        .join(" ")
        .toLowerCase()
        .split(/[^a-z0-9+]+/g)
        .filter(Boolean)
    )
  );

export const transformCatalogRow = (row, index) => {
  const name = String(row.product_name || "").trim();
  const price = parseRupee(row.price);
  const discountPercent = determineDiscount(name);
  const originalPrice = Math.ceil((price / (1 - discountPercent / 100)) / 5) * 5;
  const category = determineCategory(name, price);
  const subCategory = determineSubCategory(name, category);
  const ageGroup = determineAgeGroup(name, price);
  const moq = determineMOQ(name);
  const stockCount = determineStock(name, index);
  const limitedStock = stockCount <= 8;
  const featured = index < 12 || (discountPercent >= 20 && stockCount > 5);
  const badge = limitedStock
    ? "Limited Stock"
    : discountPercent >= 20
      ? "Sale Ending Soon"
      : featured
        ? "Best Seller"
        : "Fast Moving";

  return {
    sku: `AI4K-${String(index + 1).padStart(4, "0")}`,
    name,
    slug: slugify(name),
    price,
    originalPrice,
    discountPercent,
    imageUrl: row.image_url,
    gallery: [row.image_url].filter(Boolean),
    videoUrl: row.video_url || "",
    description: buildDescription({ name, ageGroup, category, subCategory }),
    shortDescription: `${discountPercent}% off on ${name.toLowerCase()} for ages ${ageGroup}.`,
    category,
    subCategory,
    ageGroup,
    moq,
    stockCount,
    limitedStock,
    badge,
    featured,
    tags: buildTags({ name, category, ageGroup, subCategory }),
    isActive: true,
  };
};
