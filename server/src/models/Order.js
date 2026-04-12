import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ["product", "combo"],
      default: "product",
      required: true,
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    comboKey: { type: String, default: "", trim: true },
    sku: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    ageGroup: { type: String, required: true, trim: true },
    moq: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
    bundleItems: {
      type: [
        new mongoose.Schema(
          {
            name: { type: String, required: true, trim: true },
            imageUrl: { type: String, required: true, trim: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    customer: { type: customerSchema, required: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "At least one item is required.",
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: "", trim: true, uppercase: true },
    totalAmount: { type: Number, required: true, min: 0 },
    codConfirmationFee: { type: Number, default: 0, min: 0 },
    paymentMode: {
      type: String,
      enum: ["cod_deposit", "full_payment"],
      required: true,
    },
    paymentAmount: { type: Number, required: true, min: 0 },
    depositAmount: { type: Number, default: 0, min: 0 },
    balanceDue: { type: Number, default: 0, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["created", "paid", "deposit_paid", "failed", "refunded"],
      default: "created",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    razorpayOrderId: { type: String, default: "", trim: true },
    razorpayPaymentId: { type: String, default: "", trim: true },
    razorpaySignature: { type: String, default: "", trim: true },
    paymentGateway: { type: String, enum: ["razorpay", "mock"], default: "razorpay" },
    source: { type: String, default: "instagram_ads", trim: true },
    checkoutToken: {
      type: String,
      default: undefined,
      trim: true,
      index: true,
      unique: true,
      sparse: true,
    },
    whatsappStatus: {
      type: String,
      enum: ["pending", "sent", "failed", "skipped"],
      default: "pending",
    },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

orderSchema.index({ orderNumber: 1, createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);
