import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { getProduct } from "@/lib/api/products";
import { ProductDetailView } from "@/components/products/product-detail-view";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const response = await getProduct(slug, 60).catch(() => null);

  if (!response?.product) {
    return (
      <PageContainer>
        <EmptyState title="Product not found" text="We couldn't load this product right now." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ProductDetailView product={response.product} relatedProducts={response.relatedProducts || []} />
    </PageContainer>
  );
}
