import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/api/products";
import { SITE_URL } from "@/lib/seo/product-seo";

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: `${SITE_URL}/`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${SITE_URL}/products`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.95,
  },
  {
    url: `${SITE_URL}/about`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${SITE_URL}/shipping-policy`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  },
  {
    url: `${SITE_URL}/privacy-policy`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  },
  {
    url: `${SITE_URL}/return-refund-policy`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const response = await getProducts({ limit: 1000 }, 300).catch(() => null);

  if (!response?.products?.length) {
    return staticRoutes;
  }

  const productRoutes: MetadataRoute.Sitemap = response.products
    .filter((product) => product.slug && product.isActive !== false)
    .map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  return [...staticRoutes, ...productRoutes];
}
