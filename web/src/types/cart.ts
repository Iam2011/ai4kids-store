export type ComboBundleItem = {
  name: string;
  imageUrl: string;
};

export type ComboOffer = {
  key: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  category: string;
  ageGroup: string;
  moq: number;
  imageUrl: string;
  bundleItems: ComboBundleItem[];
};

export type CartItem = {
  itemType: "product" | "combo";
  itemKey: string;
  productId: string;
  comboKey: string;
  sku: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  category: string;
  ageGroup: string;
  discountPercent: number;
  moq: number;
  stockCount: number;
  quantity: number;
  bundleItems?: ComboBundleItem[];
};

export type CouponState = {
  code: string;
  discountAmount: number;
  allowOnCod?: boolean;
  allowOnFull?: boolean;
};
