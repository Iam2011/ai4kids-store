import mongoose from "mongoose";

const visitEventSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, trim: true, index: true },
    path: { type: String, required: true, trim: true, index: true },
    referrer: { type: String, default: "", trim: true },
    userAgent: { type: String, default: "", trim: true },
    deviceType: { type: String, default: "unknown", trim: true },
    ip: { type: String, default: "", trim: true, index: true },
    city: { type: String, default: "Unknown", trim: true, index: true },
    state: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

visitEventSchema.index({ createdAt: -1, city: 1 });

export const VisitEvent = mongoose.model("VisitEvent", visitEventSchema);
