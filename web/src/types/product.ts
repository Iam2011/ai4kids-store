export type Product = {
  _id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  imageUrl: string;
  gallery: string[];
  features: string[];
  videoUrl?: string;
  description: string;
  shortDescription: string;
  category: string;
  rawCategory?: string;
  subCategory?: string;
  ageGroup: "0-2" | "3-5" | "6-8" | "9+";
  moq: number;
  stockCount: number;
  limitedStock: boolean;
  badge?: string;
  featured?: boolean;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  mainImageSource?: "google_drive" | "external";
  homeRailEligible?: boolean;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
};

export type ProductsResponse = {
  total: number;
  filters: {
    ageGroup: string;
    category: string;
    search: string;
    featured: string;
    homeRail: string;
    sort: string;
  };
  products: Product[];
};

export type ProductDetailResponse = {
  product: Product;
  relatedProducts: Product[];
};
