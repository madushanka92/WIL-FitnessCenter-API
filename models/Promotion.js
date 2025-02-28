import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    promo_code: { type: String, required: true, unique: true },
    percentage: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Promotion", promotionSchema);
