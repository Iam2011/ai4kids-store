import mongoose from "mongoose";

const geoCacheSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true, unique: true, trim: true },
    city: { type: String, default: "Unknown", trim: true },
    state: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export const GeoCache = mongoose.model("GeoCache", geoCacheSchema);
