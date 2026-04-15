import crypto from "crypto";
import Razorpay from "razorpay";
import { Order } from "../models/Order.js";
import { sendWhatsappNotification } from "../services/whatsappService.js";
import { calculateOrderPricing } from "../utils/orderPricing.js";

const getGatewayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const generateOrderNumber = () =>
  `AI4K-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;

const sanitizeCustomer = (customer = {}) => ({
  name: String(customer.name || "").trim(),
  mobile: String(customer.mobile || "").replace(/\D+/g, "").trim(),
  address: String(customer.address || "").trim(),
  pincode: String(customer.pincode || "").replace(/\D+/g, "").trim(),
  city: String(customer.city || "").trim(),
  state: String(customer.state || "").trim(),
});

const sanitizeAnalyticsSnapshot = (snapshot = {}) => ({
  sessionId: String(snapshot.sessionId || "").trim(),
  sourceLabel: String(snapshot.sourceLabel || "Direct").trim() || "Direct",
  sourceType: String(snapshot.sourceType || "Direct").trim() || "Direct",
  campaignLabel: String(snapshot.campaignLabel || "Direct").trim() || "Direct",
  rawReferrer: String(snapshot.rawReferrer || "").trim(),
  rawUTM: {
    source: String(snapshot.rawUTM?.source || "").trim(),
    medium: String(snapshot.rawUTM?.medium || "").trim(),
    campaign: String(snapshot.rawUTM?.campaign || "").trim(),
    content: String(snapshot.rawUTM?.content || "").trim(),
    term: String(snapshot.rawUTM?.term || "").trim(),
  },
  landingPath: String(snapshot.landingPath || "").trim(),
  landingPageLabel: String(snapshot.landingPageLabel || "").trim(),
});

const buildOrderPayload = (order) => ({
  orderId: order._id,
  orderNumber: order.orderNumber,
    paymentGateway: order.paymentGateway,
  keyId: process.env.RAZORPAY_KEY_ID || "mock_key",
  razorpayOrderId: order.razorpayOrderId,
  amount: order.paymentAmount,
  currency: process.env.RAZORPAY_CURRENCY || "INR",
  totalAmount: order.totalAmount,
  codConfirmationFee: order.codConfirmationFee || 0,
  depositAmount: order.depositAmount,
  balanceDue: order.balanceDue,
  customer: order.customer,
});

export const createPaymentOrder = async (req, res) => {
  const {
    customer,
    cartItems,
    couponCode,
    paymentMode,
    notes = "",
    source = "instagram_ads",
    checkoutToken = "",
    analyticsSnapshot = {},
  } = req.body;
  const sanitizedCustomer = sanitizeCustomer(customer);
  const normalizedCheckoutToken = String(checkoutToken || "").trim();
  const normalizedAnalyticsSnapshot = sanitizeAnalyticsSnapshot(analyticsSnapshot);

  if (
    !sanitizedCustomer.name ||
    !sanitizedCustomer.mobile ||
    !sanitizedCustomer.address ||
    !sanitizedCustomer.pincode ||
    !sanitizedCustomer.city ||
    !sanitizedCustomer.state
  ) {
    return res.status(400).json({ message: "Customer information is incomplete." });
  }

  if (!/^\d{10}$/.test(sanitizedCustomer.mobile)) {
    return res.status(400).json({ message: "Enter a valid 10-digit mobile number." });
  }

  if (!/^\d{6}$/.test(sanitizedCustomer.pincode)) {
    return res.status(400).json({ message: "Enter a valid 6-digit pincode." });
  }

  if (!["cod_deposit", "full_payment"].includes(paymentMode)) {
    return res.status(400).json({ message: "Invalid payment mode selected." });
  }

  if (normalizedCheckoutToken) {
    const existingOrder = await Order.findOne({ checkoutToken: normalizedCheckoutToken });

    if (existingOrder) {
      return res.status(200).json(buildOrderPayload(existingOrder));
    }
  }

  const pricing = await calculateOrderPricing({ cartItems, couponCode, paymentMode });
  const razorpayClient = getGatewayClient();
  const allowMockPayments = process.env.ALLOW_MOCK_PAYMENTS === "true";
  let paymentGateway = "razorpay";
  const orderNumber = generateOrderNumber();
  let gatewayOrderId = "";

  if (pricing.paymentAmount <= 0) {
    paymentGateway = "mock";
    gatewayOrderId = `free_order_${crypto.randomUUID()}`;
  } else if (razorpayClient) {
    const gatewayOrder = await razorpayClient.orders.create({
      amount: Math.round(pricing.paymentAmount * 100),
      currency: process.env.RAZORPAY_CURRENCY || "INR",
      receipt: orderNumber,
      notes: { paymentMode },
    });

    gatewayOrderId = gatewayOrder.id;
  } else if (allowMockPayments) {
    paymentGateway = "mock";
    gatewayOrderId = `mock_order_${crypto.randomUUID()}`;
  } else {
    return res.status(503).json({
      message: "Razorpay is not configured. Set credentials or enable mock payments.",
    });
  }

  const order = await Order.create({
    orderNumber,
    customer: {
      name: sanitizedCustomer.name,
      mobile: sanitizedCustomer.mobile,
      address: sanitizedCustomer.address,
      pincode: sanitizedCustomer.pincode,
      city: sanitizedCustomer.city,
      state: sanitizedCustomer.state,
    },
    items: pricing.items,
    subtotal: pricing.subtotal,
    couponCode: pricing.couponCode,
    discountAmount: pricing.discountAmount,
    totalAmount: pricing.totalAmount,
    codConfirmationFee: pricing.codConfirmationFee,
    paymentMode,
    paymentAmount: pricing.paymentAmount,
    depositAmount: pricing.depositAmount,
    balanceDue: pricing.balanceDue,
    razorpayOrderId: gatewayOrderId,
    paymentGateway,
    source,
    analyticsSnapshot: normalizedAnalyticsSnapshot,
    notes: String(notes || "").trim(),
    checkoutToken: normalizedCheckoutToken,
    whatsappStatus: "pending",
  });

  res.status(201).json(buildOrderPayload(order));
};

export const verifyPayment = async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;
  const order = await Order.findById(orderId);
  const isZeroAdvanceCod = order?.paymentMode === "cod_deposit" && Number(order?.paymentAmount || 0) <= 0;

  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  if (
    ["paid", "deposit_paid"].includes(order.paymentStatus) ||
    (isZeroAdvanceCod && order.orderStatus === "confirmed")
  ) {
    return res.json({
      success: true,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
    });
  }

  const isMockPayment = order.paymentGateway === "mock" || isMock;

  if (!isMockPayment) {
    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (signature !== razorpay_signature) {
      order.paymentStatus = "failed";
      await order.save();
      return res.status(400).json({ message: "Payment signature verification failed." });
    }
  }

  order.razorpayOrderId = razorpay_order_id || order.razorpayOrderId;
  order.razorpayPaymentId = razorpay_payment_id || `mock_payment_${crypto.randomUUID()}`;
  order.razorpaySignature = razorpay_signature || "mock_signature";
  order.paymentStatus = isZeroAdvanceCod
    ? "created"
    : order.paymentMode === "cod_deposit"
      ? "deposit_paid"
      : "paid";
  order.orderStatus = "confirmed";

  try {
    const whatsappResult = await sendWhatsappNotification(order);
    order.whatsappStatus = whatsappResult.status;
  } catch (error) {
    order.whatsappStatus = "failed";
  }

  await order.save();

  res.json({
    success: true,
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
  });
};

export const markPaymentFailure = async (req, res) => {
  const { orderId, reason = "Payment failed or was cancelled." } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "orderId is required." });
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  if (["paid", "deposit_paid"].includes(order.paymentStatus)) {
    return res.json({ success: true, ignored: true });
  }

  order.paymentStatus = "failed";
  order.notes = [order.notes, reason].filter(Boolean).join(" | ");
  await order.save();

  res.json({ success: true });
};
