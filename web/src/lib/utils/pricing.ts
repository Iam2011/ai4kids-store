import type { CartItem } from "@/types/cart";

export const calculateCodConfirmationFee = (items: CartItem[] = []) =>
  0;

export const getPreviewTotal = (subtotal: number, discount: number) =>
  Math.max(0, subtotal - discount);
