const CATALOG_SOURCE = "ai4kids_website_xlsx";

const normalizedCategoryMap = [
  {
    label: "Remote Control Toys",
    matchers: [
      "remote",
      "rc",
      "control",
      "drone",
      "helicopter",
      "plane",
      "stunt car",
      "truck",
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
      "board game",
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
    matchers: ["doll", "doll house", "musical doll", "rotating doll", "animal toy", "soft toy", "plush"],
  },
  {
    label: "Role Play & Kitchen Toys",
    matchers: ["kitchen", "role play", "doctor", "household", "beauty", "tea set", "cash register"],
  },
  {
    label: "Outdoor & Sports Toys",
    matchers: ["scooter", "tricycle", "skates", "badminton", "football", "sports", "ride", "outdoor"],
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

const unique = (values) => Array.from(new Set(values.filter(Boolean)));

const normalizeCategory = (rawCategory = "", name = "") => {
  const haystack = `${rawCategory} ${name}`.toLowerCase();
  const match = normalizedCategoryMap.find(({ matchers }) =>
    matchers.some((matcher) => haystack.includes(matcher))
  );

  return match?.label || "Baby & Small Toys";
};

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
  const name = String(row.name || "").trim();
  const rawCategory = String(row.category || "").trim();
  const price = parseNumber(row.sale_price);
  const discountPercent = Math.max(0, Math.min(90, parseNumber(row.discount_percent)));
  const rating = Math.max(0, Math.min(5, parseNumber(row.rating, 4.5)));
  const reviewCount = Math.max(0, parseNumber(row.review_count, 0));
  const normalizedCategory = normalizeCategory(rawCategory, name);
  const ageGroup = deriveAgeGroup({
    name,
    rawCategory,
    price,
    normalizedCategory,
  });
  const originalPrice = deriveOriginalPrice(price, parseNumber(row.mrp), discountPercent);
  const gallery = unique([row.main_image, row.image1, row.image2, row.image3]);
  const imageUrl = gallery[0] || "";
  const features = unique(
    String(row.features || "")
      .split(",")
      .map((entry) => entry.trim())
  );
  const stockCount = deriveStockCount(row.sku || row.id || index, name);
  const limitedStock = stockCount <= 11;
  const featured = discountPercent >= 28 || rating >= 4.7 || reviewCount >= 160 || index < 30;

  return {
    sku: String(row.sku || `SKU-${index + 1}`).trim(),
    name,
    slug: String(row.slug || "")
      .trim()
      .toLowerCase(),
    price,
    originalPrice,
    discountPercent,
    imageUrl,
    gallery,
    features,
    videoUrl: "",
    description: String(row.description || "").trim(),
    shortDescription: String(row.short_description || "").trim(),
    category: normalizedCategory,
    rawCategory,
    subCategory: rawCategory || normalizedCategory,
    ageGroup,
    moq: 1,
    stockCount,
    limitedStock,
    badge: deriveBadge({ discountPercent, featured, limitedStock }),
    featured,
    tags: buildTags({
      name,
      rawCategory,
      normalizedCategory,
      ageGroup,
      features,
    }),
    rating,
    reviewCount,
    catalogSource,
    isActive: true,
  };
};
