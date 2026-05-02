import { formatProductName } from "@/lib/utils/normalize-product-text";
import type { Product } from "@/types/product";

export const SITE_URL = "https://ai4kids.in";
export const SITE_NAME = "AI4Kids";
const DEFAULT_DESCRIPTION =
  "Curated toys, playful gifting, and smart shopping for families across India.";

const toCleanText = (value?: string) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

export const getProductDisplayName = (product: Pick<Product, "name">) =>
  formatProductName(product.name || "").trim() || "Toy";

export const getProductPath = (slug: string) => `/products/${slug}`;

export const getAbsoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const getCanonicalProductUrl = (slug: string) => getAbsoluteUrl(getProductPath(slug));

export const getProductDescription = (product?: Partial<Product> | null) => {
  if (!product) return DEFAULT_DESCRIPTION;

  const primary = toCleanText(product.shortDescription) || toCleanText(product.description);
  if (primary) return primary.slice(0, 180);

  const name = getProductDisplayName({ name: product.name || "" });
  return `Shop ${name} for kids at AI4Kids. Explore fun, learning, and remote control toys with secure checkout.`;
};

export const getProductImageUrls = (product: Product) => {
  const images = [product.imageUrl, ...(product.gallery || [])].filter(Boolean);
  const unique = Array.from(new Set(images));
  return unique.map((url) => (url.startsWith("http") ? url : getAbsoluteUrl(url)));
};

const pruneUndefined = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => pruneUndefined(item)).filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
      if (inner === undefined || inner === null || inner === "") continue;
      next[key] = pruneUndefined(inner);
    }
    return next as T;
  }

  return value;
};

export const stringifyJsonLd = (value: unknown) => JSON.stringify(pruneUndefined(value));

export const buildProductJsonLd = (product: Product) => {
  const displayName = getProductDisplayName(product);
  const canonical = getCanonicalProductUrl(product.slug);
  const images = getProductImageUrls(product);
  const description = getProductDescription(product);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayName,
    description,
    image: images.length === 1 ? images[0] : images,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    url: canonical,
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "INR",
      price: String(product.price),
      availability:
        product.stockCount <= 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  if ((product.rating || 0) > 0 && (product.reviewCount || 0) > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }

  return data;
};

export const buildProductBreadcrumbJsonLd = (product: Product) => {
  const displayName = getProductDisplayName(product);
  const productUrl = getCanonicalProductUrl(product.slug);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: getAbsoluteUrl("/products"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: displayName,
        item: productUrl,
      },
    ],
  };
};
