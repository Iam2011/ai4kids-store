import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { getProduct } from "@/lib/api/products";
import { ProductDetailView } from "@/components/products/product-detail-view";
import { formatProductName } from "@/lib/utils/normalize-product-text";
import {
  buildProductBreadcrumbJsonLd,
  buildProductJsonLd,
  getCanonicalProductUrl,
  getProductDescription,
  getProductImageUrls,
  stringifyJsonLd,
} from "@/lib/seo/product-seo";

const FALLBACK_TITLE = "Product | AI4Kids";
const FALLBACK_DESCRIPTION =
  "Explore fun, learning, and remote control toys for kids at AI4Kids with secure checkout.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const canonical = getCanonicalProductUrl(slug);

  const response = await getProduct(slug, 60).catch(() => null);
  const product = response?.product;

  if (!product) {
    return {
      title: FALLBACK_TITLE,
      description: FALLBACK_DESCRIPTION,
      alternates: { canonical },
      openGraph: {
        title: FALLBACK_TITLE,
        description: FALLBACK_DESCRIPTION,
        type: "website",
        url: canonical,
      },
      twitter: {
        card: "summary_large_image",
        title: FALLBACK_TITLE,
        description: FALLBACK_DESCRIPTION,
      },
    };
  }

  const displayName = formatProductName(product.name || "").trim() || product.name;
  const title = `${displayName} | AI4Kids`;
  const description = getProductDescription(product);
  const images = getProductImageUrls(product);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      images: images.length
        ? images.map((url) => ({
            url,
            alt: displayName,
          }))
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length ? [images[0]] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const response = await getProduct(slug, 60).catch(() => null);

  if (!response?.product) {
    return (
      <PageContainer className="max-w-[1240px] px-3 pb-28 pt-4 sm:px-4">
        <EmptyState title="Product not found" text="We couldn't load this product right now." />
      </PageContainer>
    );
  }

  const productJsonLd = buildProductJsonLd(response.product);
  const breadcrumbJsonLd = buildProductBreadcrumbJsonLd(response.product);

  return (
    <PageContainer className="max-w-[1240px] px-3 pb-28 pt-4 sm:px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }}
      />
      <ProductDetailView product={response.product} relatedProducts={response.relatedProducts || []} />
    </PageContainer>
  );
}
