import { BenefitsGrid } from "@/components/benefits/benefits-grid";
import { CategoryGrid } from "@/components/categories/category-grid";
import { HeroBanner } from "@/components/hero/hero-banner";
import { ProductGrid } from "@/components/products/product-grid";
import { AboutBlock } from "@/components/trust/about-block";
import { TrustedFamiliesCard } from "@/components/trust/trusted-families-card";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { getProducts } from "@/lib/api/products";

export default async function HomePage() {
  const featuredRailResponse = await getProducts(
    {
      homeRail: true,
      limit: 39,
      sort: "featured",
    },
    60
  ).catch(() => ({ products: [] }));

  return (
    <PageContainer className="max-w-[404px] gap-4 px-4 pb-32 pt-4 sm:max-w-3xl lg:max-w-6xl">
      <HeroBanner />
      <BenefitsGrid />
      <TrustedFamiliesCard />
      <CategoryGrid />

      <section className="rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(255,246,252,0.94))] p-5 shadow-[0_24px_54px_rgba(185,153,224,0.16)]">
        <SectionHeader title="Featured Toys" actionHref="/products" />
        <ProductGrid products={featuredRailResponse.products || []} variant="featuredRail" />
      </section>

      <AboutBlock />
    </PageContainer>
  );
}
