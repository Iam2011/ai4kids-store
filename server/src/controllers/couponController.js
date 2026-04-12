import { Coupon } from "../models/Coupon.js";
import { calculateCouponDiscount } from "../utils/orderPricing.js";

export const validateCoupon = async (req, res) => {
  const { couponCode, subtotal = 0, paymentMode = "full_payment" } = req.body;
  const normalizedCode = String(couponCode || "").trim().toUpperCase();

  if (!normalizedCode) {
    return res.status(400).json({ message: "Coupon code is required." });
  }

  const coupon = await Coupon.findOne({ code: normalizedCode }).lean();

  if (!coupon || !coupon.active) {
    return res.status(404).json({ message: "Coupon not found." });
  }

  const discountAmount = calculateCouponDiscount({
    coupon,
    subtotal: Number(subtotal || 0),
    paymentMode,
  });

  if (!discountAmount) {
    return res.status(400).json({
      message: "Coupon is not applicable for this cart or payment option.",
    });
  }

  res.json({
    code: coupon.code,
    description: coupon.description,
    discountAmount,
    previewTotal: Math.max(0, Number(subtotal || 0) - discountAmount),
    allowOnCod: coupon.allowOnCod,
    allowOnFull: coupon.allowOnFull,
    minOrderAmount: coupon.minOrderAmount,
  });
};
