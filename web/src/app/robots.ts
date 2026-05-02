import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/product-seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/checkout",
          "/checkout/*",
          "/cart",
          "/cart/*",
          "/order-success",
          "/order-success/*",
          "/cod-success",
          "/cod-success/*",
          "/payment-failure",
          "/payment-failure/*",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
