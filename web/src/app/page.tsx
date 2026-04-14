import { BenefitsGrid } from "@/components/benefits/benefits-grid";
import { CategoryGrid } from "@/components/categories/category-grid";
import { HeroBanner } from "@/components/hero/hero-banner";
import { ProductGrid } from "@/components/products/product-grid";
import { AboutBlock } from "@/components/trust/about-block";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { getProducts } from "@/lib/api/products";
import type { Product } from "@/types/product";

const homepageShowcaseNames = [
  "T22 SCOOTER LIGHT MUSIC SENSOR",
  "TB 5141 ROCK CAR BIG TOY BOI",
  "GSH818-36 BUBBLE GUN CHARGEABLE",
  "3012 THUNDER STRIKE",
  "GY 2090-14 GOYO STUNT CAR",
  "2915 THUNDER STRIKE GUN",
  "611 SCOOTER",
  "S52P 4K SCREEN DRONE",
  "668-25 PRINCESS HOUSE 156 PCS",
  "CH1328 MAGNETIC MIND CRAFT 169 PCS",
];

const normalizeName = (value: string) => String(value || "").trim().toLowerCase();

const resolveShowcaseProduct = (products: Product[], targetName: string) => {
  const normalizedTarget = normalizeName(targetName);
  return (
    products.find((product) => normalizeName(product.name) === normalizedTarget) ||
    products.find((product) => normalizeName(product.name).includes(normalizedTarget)) ||
    products[0] ||
    null
  );
};

export default async function HomePage() {
  const productResponses = await Promise.all(
    homepageShowcaseNames.map((name) =>
      getProducts(
        {
          search: name,
          limit: 8,
        },
        60
      ).catch(() => ({ products: [] as Product[] }))
    )
  );

  const showcaseProducts = productResponses
    .map((response, index) => resolveShowcaseProduct(response.products || [], homepageShowcaseNames[index]))
    .filter(Boolean) as Product[];

  const bestSellerProducts = showcaseProducts.slice(0, 4);
  const newArrivalProducts = showcaseProducts.slice(4, 10);

  return (
    <PageContainer>
      <HeroBanner />
      <BenefitsGrid />
      <CategoryGrid />

      <section className="rounded-[30px] bg-white/90 p-5 shadow-[0_24px_60px_rgba(153,132,196,0.14)]">
        <SectionHeader title="Best Sellers" actionHref="/products?featured=true" />
        <ProductGrid products={bestSellerProducts} variant="home" />
        <p className="mt-4 text-center text-sm text-[#8b7fa8]">COD Fee: ₹40 per Product</p>
      </section>

      <section className="rounded-[30px] bg-white/90 p-5 shadow-[0_24px_60px_rgba(153,132,196,0.14)]">
        <SectionHeader title="New Arrivals" actionHref="/products?sort=latest" />
        <ProductGrid products={newArrivalProducts} variant="home" />
      </section>

      <AboutBlock />
    </PageContainer>
  );
}
