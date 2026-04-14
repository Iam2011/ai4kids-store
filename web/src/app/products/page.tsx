import { getProducts } from "@/lib/api/products";
import { listingCopy } from "@/lib/constants/copy";
import { ProductsClientPage } from "./products-client-page";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const normalized = {
    category: typeof params.category === "string" ? params.category : "",
    sort: typeof params.sort === "string" ? params.sort : "featured",
    featured: typeof params.featured === "string" ? params.featured : "",
    search: typeof params.search === "string" ? params.search : "",
  };

  const response = await getProducts(
    {
      ...normalized,
      limit: 60,
    },
    60
  ).catch(() => null);

  return (
    <ProductsClientPage
      initialProducts={response?.products || []}
      initialError={response ? "" : listingCopy.error}
    />
  );
}
