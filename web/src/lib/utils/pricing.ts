export const calculateCodConfirmationFee = () =>
  0;

export const getPreviewTotal = (subtotal: number, discount: number) =>
  Math.max(0, subtotal - discount);
