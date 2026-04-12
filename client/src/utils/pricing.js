const COD_FEE_PER_PRODUCT = Number(
  import.meta.env.VITE_COD_CONFIRMATION_FEE_PER_ITEM ||
    import.meta.env.VITE_COD_CONFIRMATION_AMOUNT ||
    40
);

const getBillableUnitCount = (item) =>
  item.itemType === "combo"
    ? Math.max(1, Number(item.bundleItems?.length || 0)) * Number(item.quantity || 1)
    : Number(item.quantity || 1);

export const calculateCodConfirmationFee = (items = []) =>
  items.reduce((total, item) => total + getBillableUnitCount(item) * COD_FEE_PER_PRODUCT, 0);
