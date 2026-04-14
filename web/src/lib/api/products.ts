import type { ProductDetailResponse, ProductsResponse } from "@/types/product";
import { apiFetch } from "./client";

type ProductQuery = {
  search?: string;
  ageGroup?: string;
  category?: string;
  featured?: string | boolean;
  sort?: string;
  limit?: number;
};

export const getProducts = (params: ProductQuery = {}, revalidate = 60) =>
  apiFetch<ProductsResponse>("/products", { params, revalidate });

export const getProduct = (slug: string, revalidate = 60) =>
  apiFetch<ProductDetailResponse>(`/products/${slug}`, { revalidate });
