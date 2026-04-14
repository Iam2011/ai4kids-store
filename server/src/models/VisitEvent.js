import mongoose from "mongoose";

const visitEventSchema = new mongoose.Schema(
  {
    eventType: { type: String, default: "page_view", trim: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    sessionId: { type: String, required: true, trim: true, index: true },
    path: { type: String, required: true, trim: true, index: true },
    pageLabel: { type: String, default: "", trim: true, index: true },
    isLandingPage: { type: Boolean, default: false },
    referrer: { type: String, default: "", trim: true },
    rawReferrer: { type: String, default: "", trim: true },
    userAgent: { type: String, default: "", trim: true },
    deviceType: { type: String, default: "unknown", trim: true },
    ip: { type: String, default: "", trim: true, index: true },
    city: { type: String, default: "Unknown", trim: true, index: true },
    state: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
    sourceLabel: { type: String, default: "Direct", trim: true, index: true },
    sourceType: { type: String, default: "Direct", trim: true, index: true },
    campaignLabel: { type: String, default: "Direct", trim: true, index: true },
    rawUTM: {
      type: new mongoose.Schema(
        {
          source: { type: String, default: "", trim: true },
          medium: { type: String, default: "", trim: true },
          campaign: { type: String, default: "", trim: true },
          content: { type: String, default: "", trim: true },
          term: { type: String, default: "", trim: true },
        },
        { _id: false }
      ),
      default: () => ({}),
    },
    productId: { type: String, default: "", trim: true, index: true },
    productName: { type: String, default: "", trim: true },
    category: { type: String, default: "", trim: true, index: true },
    categoryLabel: { type: String, default: "", trim: true, index: true },
    searchTerm: { type: String, default: "", trim: true },
    paymentOption: { type: String, default: "", trim: true },
    orderNumber: { type: String, default: "", trim: true, index: true },
    orderValue: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

visitEventSchema.index({ createdAt: -1, city: 1 });
visitEventSchema.index({ sessionId: 1, createdAt: 1 });
visitEventSchema.index({ eventType: 1, createdAt: -1 });
visitEventSchema.index({ sourceLabel: 1, createdAt: -1 });

export const VisitEvent = mongoose.model("VisitEvent", visitEventSchema);
