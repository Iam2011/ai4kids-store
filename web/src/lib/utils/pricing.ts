import type { CartItem } from "@/types/cart";

const COD_FEE_PER_PRODUCT = Number(
  process.env.NEXT_PUBLIC_COD_CONFIRMATION_FEE_PER_ITEM ||
    process.env.NEXT_PUBLIC_COD_CONFIRMATION_AMOUNT ||
    40
);

const getBillableUnitCount = (item: CartItem) =>
  item.itemType === "combo"
    ? Math.max(1, Number(item.bundleItems?.length || 0)) * Number(item.quantity || 1)
    : Number(item.quantity || 1);

export const calculateCodConfirmationFee = (items: CartItem[] = []) =>
  items.reduce((total, item) => total + getBillableUnitCount(item) * COD_FEE_PER_PRODUCT, 0);

export const getPreviewTotal = (subtotal: number, discount: number) =>
  Math.max(0, subtotal - discount);
