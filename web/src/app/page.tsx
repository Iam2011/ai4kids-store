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
  const [featuredRailResponse, droneResponse, defenderResponse, bikeResponse] = await Promise.all([
    getProducts(
      {
        homeRail: true,
        limit: 4,
        sort: "featured",
      },
      60
    ).catch(() => ({ products: [] })),
    getProducts({ search: "E-88 DRONE WHITE", limit: 1 }, 60).catch(() => ({ products: [] })),
    getProducts({ search: "defender", limit: 1 }, 60).catch(() => ({ products: [] })),
    getProducts({ search: "royal enfield", limit: 1 }, 60).catch(() => ({ products: [] })),
  ]);

  const heroLinks = {
    drone: droneResponse.products?.[0]?.slug,
    defender: defenderResponse.products?.[0]?.slug,
    bike: bikeResponse.products?.[0]?.slug,
  };

  return (
    <PageContainer className="max-w-[404px] gap-4 px-4 pb-32 pt-4">
      <HeroBanner heroLinks={heroLinks} />
      <BenefitsGrid />
      <TrustedFamiliesCard />
      <CategoryGrid />

      <section className="rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,243,255,0.96))] p-4 shadow-[0_20px_48px_rgba(160,129,213,0.15)]">
        <SectionHeader title="Featured Toys" actionHref="/products" />
        <ProductGrid products={featuredRailResponse.products || []} variant="featuredRail" />
      </section>

      <AboutBlock />
    </PageContainer>
  );
}
