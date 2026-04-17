import { slugify } from "./slugify.js";

const CATALOG_SOURCE = "zee_master_file_pricing_framework_continued";
export const MIN_VISIBLE_PRODUCT_PRICE = 0;

const titleCorrections = {
  dargon: "Dragon",
  monstar: "Monster",
  boi: "Boy",
};

const preserveUppercaseTokens = new Set(["rc", "uno", "diy", "led", "usb", "gps", "4k", "3d"]);
const minorWords = new Set(["and", "or", "for", "with", "of", "the", "to", "in", "on"]);

const normalizedCategoryMap = [
  {
    label: "Remote Control Toys",
    matchers: [
      "remote",
      "rc",
      "control",
      "car",
      "drone",
      "helicopter",
      "plane",
      "stunt car",
      "truck",
      "drift",
      "monster",
      "rock car",
      "off road",
      "tesla",
      "tank",
      "bike",
      "monster car",
      "rc robot",
      "robot rc",
      "panda",
      "frog",
    ],
  },
  {
    label: "Gun & Blasters",
    matchers: [
      "gun",
      "blaster",
      "bubble gun",
      "gel gun",
      "jelly gun",
      "smoke gun",
      "laser gun",
      "bullet",
      "soft bullet",
      "gatling",
      "police gun",
      "shooter",
      "weapon",
    ],
  },
  {
    label: "Educational & Learning Toys",
    matchers: [
      "educational",
      "learning",
      "science",
      "lab",
      "puzzle",
      "blocks",
      "magnetic",
      "mind craft",
      "mini printer",
      "printer",
      "camera",
      "school",
    ],
  },
  {
    label: "Games & Indoor Toys",
    matchers: [
      "game",
      "board game",
      "board",
      "card game",
      "video game",
      "tv game",
      "foosball",
      "table tennis",
      "boxing",
      "steering",
      "uno",
      "ludo",
      "chess",
      "monopoly",
      "scattergories",
    ],
  },
  {
    label: "Dolls & Soft Toys",
    matchers: ["doll", "barbie", "doll house", "musical doll", "rotating doll", "animal toy", "soft toy", "plush"],
  },
  {
    label: "Role Play & Kitchen Toys",
    matchers: ["kitchen", "cooking", "role play", "doctor", "household", "beauty", "tea set", "cash register"],
  },
  {
    label: "Outdoor & Sports Toys",
    matchers: ["scooter", "tricycle", "skates", "badminton", "football", "cricket", "sports", "ride", "outdoor"],
  },
  {
    label: "Baby & Small Toys",
    matchers: ["rattle", "bath toy", "small toy", "push & go", "push and go", "spinning top", "walker", "baby"],
  },
  {
    label: "Water & Pool Toys",
    matchers: ["intex pool", "pool", "water", "shower", "ball pool", "swimming"],
  },
  {
    label: "Creative & Hobby Toys",
    matchers: ["clay", "slime", "diy", "craft", "art & craft", "foam clay", "mud slime"],
  },
  {
    label: "Party & Fun Toys",
    matchers: ["bubble toy", "party", "magic", "whistle", "fun toy", "flash", "light"],
  },
  {
    label: "Vehicles & Cars",
    matchers: ["die cast", "friction", "racing", "construction", "car", "bus", "vehicle", "truck"],
  },
];

const keywordAgeMap = {
  "0-2": ["baby", "rattle", "walker", "teether", "infant", "toddler"],
  "3-5": ["doll", "kitchen", "doctor", "bubble", "animal", "small toy", "bath", "push"],
  "6-8": ["rc", "remote", "gun", "blaster", "battle", "sports", "car", "pool", "puzzle"],
  "9+": ["board game", "chess", "craft", "science", "advanced", "drone"],
};

const hashText = (value) =>
  Array.from(String(value || "")).reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 1),
    0
  );

const parseNumber = (value, fallback = 0) => {
  const normalized = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(normalized) ? normalized : fallback;
};

const getField = (row, keys = []) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return "";
};

const toDirectImageUrl = (value = "") => {
  const url = String(value || "").trim();
  if (!url) return "";

  const driveId =
    url.match(/\/file\/d\/([^/]+)/i)?.[1] ||
    url.match(/[?&]id=([^&]+)/i)?.[1] ||
    "";

  if (driveId) {
    return `https://drive.google.com/uc?export=view&id=${driveId}`;
  }

  return url;
};

const getMainImageSource = (url = "") =>
  /drive\.google\.com/i.test(String(url || "")) ? "google_drive" : "external";

const normalizeDiscountPercent = (value = "") => {
  const parsed = parseNumber(value, 0);
  if (parsed > 0 && parsed <= 1) {
    return Math.round(parsed * 100);
  }

  return Math.max(0, Math.min(90, Math.round(parsed)));
};

const unique = (values) => Array.from(new Set(values.filter(Boolean)));

const capitalize = (value) => (value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value);

const normalizeTitleWord = (word, index) => {
  const match = String(word || "").match(/^([^A-Za-z0-9]*)([A-Za-z0-9&+-]+)([^A-Za-z0-9]*)$/);
  if (!match) return word;

  const [, prefix, core, suffix] = match;
  const lowerCore = core.toLowerCase();
  const upperCore = core.toUpperCase();
  let next = core;

  if (titleCorrections[lowerCore]) {
    next = titleCorrections[lowerCore];
  } else if (preserveUppercaseTokens.has(lowerCore)) {
    next = upperCore;
  } else if (/[0-9]/.test(core) || (/^[A-Z0-9-]+$/.test(core) && core.length <= 8)) {
    next = upperCore;
  } else if (core.includes("&")) {
    next = core
      .split("&")
      .map((part) => {
        const lowerPart = part.toLowerCase();
        return titleCorrections[lowerPart] || capitalize(lowerPart);
      })
      .join("&");
  } else if (index > 0 && minorWords.has(lowerCore)) {
    next = lowerCore;
  } else {
    next = capitalize(lowerCore);
  }

  return `${prefix}${next}${suffix}`;
};

export const normalizeProductTitle = (value = "") =>
  String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => normalizeTitleWord(word, index))
    .join(" ");

export const normalizeCategoryValue = (rawCategory = "", name = "") => {
  const haystack = `${rawCategory} ${name}`.toLowerCase();
  const match = normalizedCategoryMap.find(({ matchers }) =>
    matchers.some((matcher) => haystack.includes(matcher))
  );

  return match?.label || "Baby & Small Toys";
};

export const getCategoryMatchers = (label = "") =>
  normalizedCategoryMap.find((entry) => entry.label === label)?.matchers || [];

const deriveAgeGroup = ({ name = "", rawCategory = "", price = 0, normalizedCategory = "" }) => {
  const haystack = `${name} ${rawCategory} ${normalizedCategory}`.toLowerCase();

  for (const [ageGroup, matchers] of Object.entries(keywordAgeMap)) {
    if (matchers.some((matcher) => haystack.includes(matcher))) {
      return ageGroup;
    }
  }

  if (
    normalizedCategory === "Baby & Small Toys" ||
    normalizedCategory === "Dolls & Soft Toys"
  ) {
    return "3-5";
  }

  if (
    normalizedCategory === "Games & Indoor Toys" ||
    normalizedCategory === "Educational & Learning Toys" ||
    normalizedCategory === "Creative & Hobby Toys"
  ) {
    return "6-8";
  }

  if (price >= 2500) return "9+";
  if (price >= 700) return "6-8";
  return "3-5";
};

const deriveOriginalPrice = (price, mrp, discountPercent) => {
  if (mrp > price) {
    return mrp;
  }

  if (discountPercent > 0 && discountPercent < 100) {
    return Math.round((price / (1 - discountPercent / 100)) / 10) * 10;
  }

  return price;
};

const deriveStockCount = (sku, name) => (hashText(`${sku}:${name}`) % 18) + 8;

const deriveBadge = ({ discountPercent, featured, limitedStock }) => {
  if (limitedStock) return "Limited Stock";
  if (discountPercent >= 30) return "Hot Deal";
  if (featured) return "Best Seller";
  return "Trending";
};

const buildTags = ({ name, rawCategory, normalizedCategory, ageGroup, features }) =>
  unique(
    [name, rawCategory, normalizedCategory, ageGroup, ...features]
      .join(" ")
      .toLowerCase()
      .split(/[^a-z0-9+]+/g)
  );

export const getCatalogSource = (signature = "default") => `${CATALOG_SOURCE}:${signature}`;

export const getNormalizedStorefrontCategories = () =>
  normalizedCategoryMap.map((entry) => entry.label);

export const transformCatalogRow = (row, index, catalogSource = getCatalogSource()) => {
  const rawHandle = getField(row, ["1", "slug", "handle"]);
  const rawName = getField(row, ["Product Name", "name", "title"]);
  const name = normalizeProductTitle(rawName);
  const rawCategory = getField(row, ["Category", "category"]);
  const subCategory = getField(row, ["Sub Category", "subCategory", "sub_category"]);
  const price = parseNumber(getField(row, ["Selling Price", "sale_price", "price"]));
  const discountPercent = normalizeDiscountPercent(
    getField(row, ["Discount %", "discount_percent", "discountPercent"])
  );
  const rating = Math.max(0, Math.min(5, parseNumber(row.rating, 4.5)));
  const reviewCount = Math.max(0, parseNumber(row.review_count, 0));
  const normalizedCategory = normalizeCategoryValue(rawCategory, name);
  const ageGroup = deriveAgeGroup({
    name,
    rawCategory,
    price,
    normalizedCategory,
  });
  const originalPrice = deriveOriginalPrice(
    price,
    parseNumber(getField(row, ["MRP", "mrp", "originalPrice"])),
    discountPercent
  );
  const gallery = unique(
    [
      getField(row, ["main_image", "image1", "imageUrl"]),
      getField(row, ["Image 2", "image2"]),
      getField(row, ["image3", "Image 3"]),
    ].map(toDirectImageUrl)
  );
  const imageUrl = gallery[0] || "";
  const features = unique(
    [
      ...String(getField(row, ["features", "Features"]))
        .split(",")
        .map((entry) => entry.trim()),
      getField(row, ["Material", "material"]),
      getField(row, ["Color", "color"]),
      getField(row, ["Size", "size"]),
      getField(row, ["Accessories List", "accessories"]),
    ]
  );
  const stockCount = deriveStockCount(row.sku || row.id || index, name);
  const limitedStock = stockCount <= 11;
  const featured = discountPercent >= 28 || rating >= 4.7 || reviewCount >= 160 || index < 30;
  const mainImageSource = getMainImageSource(getField(row, ["main_image", "image1", "imageUrl"]));

  return {
    sku: String(getField(row, ["sku"]) || `ZEE-${slugify(rawHandle || name || index + 1)}`).trim(),
    name,
    slug: String(rawHandle || getField(row, ["slug"]) || "")
      .trim()
      .toLowerCase(),
    price,
    originalPrice,
    discountPercent,
    imageUrl,
    gallery,
    features,
    videoUrl: "",
    description: getField(row, ["Description", "description"]),
    shortDescription:
      getField(row, ["short_description"]) ||
      getField(row, ["Description", "description"]).slice(0, 180).trim(),
    category: normalizedCategory,
    rawCategory,
    subCategory: subCategory || rawCategory || normalizedCategory,
    ageGroup,
    moq: 1,
    stockCount,
    limitedStock,
    badge: deriveBadge({ discountPercent, featured, limitedStock }),
    featured,
    tags: buildTags({
      name: `${rawName} ${name}`.trim(),
      rawCategory,
      normalizedCategory,
      ageGroup,
      features,
    }),
    rating,
    reviewCount,
    mainImageSource,
    homeRailEligible: mainImageSource === "google_drive",
    catalogSource,
    isActive: true,
  };
};

export const normalizeProductRecord = (product = {}) => {
  const normalizedName = normalizeProductTitle(product.name || "");
  const normalizedCategory = normalizeCategoryValue(
    product.rawCategory || product.category || "",
    normalizedName || product.name || ""
  );

  return {
    ...product,
    name: normalizedName || product.name || "",
    category: normalizedCategory,
    subCategory: product.subCategory || product.rawCategory || normalizedCategory,
  };
};
