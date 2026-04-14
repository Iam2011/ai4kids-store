import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, required: true, min: 0, max: 90 },
    imageUrl: { type: String, required: true, trim: true },
    gallery: { type: [String], default: [] },
    features: { type: [String], default: [] },
    videoUrl: { type: String, default: "", trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    rawCategory: { type: String, default: "", trim: true },
    subCategory: { type: String, required: true, trim: true },
    ageGroup: { type: String, required: true, enum: ["0-2", "3-5", "6-8", "9+"] },
    moq: { type: Number, required: true, min: 1 },
    stockCount: { type: Number, required: true, min: 0 },
    limitedStock: { type: Boolean, default: false },
    badge: { type: String, default: "", trim: true },
    featured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    catalogSource: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ featured: 1, category: 1, ageGroup: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

export const Product = mongoose.model("Product", productSchema);
