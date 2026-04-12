import { Coupon } from "../models/Coupon.js";
import { Product } from "../models/Product.js";
import { getComboOfferByKey } from "../config/comboOffers.js";

const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const buildComboItem = (comboOffer, quantity) => {
  const normalizedQuantity = Number(quantity || 1);
  const discountPercent = Math.max(
    0,
    Math.round(
      ((Number(comboOffer.originalPrice || 0) - Number(comboOffer.price || 0)) /
        Number(comboOffer.originalPrice || 1)) *
        100
    )
  );

  return {
    itemType: "combo",
    product: null,
    comboKey: comboOffer.key,
    sku: comboOffer.sku,
    name: comboOffer.name,
    slug: comboOffer.slug,
    imageUrl: comboOffer.imageUrl,
    category: comboOffer.category,
    ageGroup: comboOffer.ageGroup,
    moq: comboOffer.moq,
    price: comboOffer.price,
    originalPrice: comboOffer.originalPrice,
    discountPercent,
    quantity: normalizedQuantity,
    lineTotal: roundCurrency(comboOffer.price * normalizedQuantity),
    bundleItems: comboOffer.bundleItems,
  };
};

export const calculateCouponDiscount = ({ coupon, subtotal, paymentMode }) => {
  if (!coupon || !coupon.active) return 0;
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) return 0;
  if (subtotal < coupon.minOrderAmount) return 0;
  if (paymentMode === "cod_deposit" && !coupon.allowOnCod) return 0;
  if (paymentMode === "full_payment" && !coupon.allowOnFull) return 0;

  const rawDiscount =
    coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;

  return coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
};

export const calculateOrderPricing = async ({ cartItems, couponCode, paymentMode }) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    const error = new Error("Your cart is empty.");
    error.statusCode = 400;
    throw error;
  }

  const productIds = cartItems.map((item) => item.productId).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true }).lean();
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  const items = cartItems.map((item) => {
    if (item.comboKey) {
      const comboOffer = getComboOfferByKey(item.comboKey);

      if (!comboOffer) {
        const error = new Error("The selected combo offer is unavailable.");
        error.statusCode = 400;
        throw error;
      }

      const quantity = Number(item.quantity || comboOffer.moq || 1);

      if (quantity < comboOffer.moq) {
        const error = new Error(`${comboOffer.name} requires a minimum order of ${comboOffer.moq}.`);
        error.statusCode = 400;
        throw error;
      }

      return buildComboItem(comboOffer, quantity);
    }

    const product = productMap.get(String(item.productId));

    if (!product) {
      const error = new Error("One or more products are unavailable.");
      error.statusCode = 400;
      throw error;
    }

    const quantity = Number(item.quantity || 1);

    if (quantity < product.moq) {
      const error = new Error(`${product.name} requires a minimum order of ${product.moq}.`);
      error.statusCode = 400;
      throw error;
    }

    return {
      itemType: "product",
      product: product._id,
      comboKey: "",
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      category: product.category,
      ageGroup: product.ageGroup,
      moq: product.moq,
      price: product.price,
      originalPrice: product.originalPrice,
      discountPercent: product.discountPercent,
      quantity,
      lineTotal: roundCurrency(product.price * quantity),
      bundleItems: [],
    };
  });

  const subtotal = roundCurrency(items.reduce((total, item) => total + item.lineTotal, 0));
  let coupon = null;

  if (couponCode) {
    coupon = await Coupon.findOne({ code: String(couponCode).trim().toUpperCase() }).lean();

    if (!coupon || !coupon.active) {
      const error = new Error("Coupon code is invalid or inactive.");
      error.statusCode = 400;
      throw error;
    }
  }

  const discountAmount = roundCurrency(
    calculateCouponDiscount({ coupon, subtotal, paymentMode })
  );
  const totalAmount = Math.max(0, roundCurrency(subtotal - discountAmount));
  const codConfirmationAmount = Number(process.env.COD_CONFIRMATION_AMOUNT || 40);
  const paymentAmount =
    paymentMode === "cod_deposit" ? Math.min(totalAmount, codConfirmationAmount) : totalAmount;
  const depositAmount = paymentMode === "cod_deposit" ? paymentAmount : 0;
  const balanceDue =
    paymentMode === "cod_deposit" ? roundCurrency(Math.max(0, totalAmount - paymentAmount)) : 0;

  return {
    items,
    subtotal,
    couponCode: coupon?.code || "",
    discountAmount,
    totalAmount,
    paymentAmount,
    depositAmount,
    balanceDue,
  };
};
