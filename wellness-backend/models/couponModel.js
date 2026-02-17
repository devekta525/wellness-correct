import { model, Schema } from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Percentage", "Fixed"], // "percentage" -> % off, "fixed" -> ₹ off
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    maxDiscount: {
      type: Number, // Optional: cap on percentage-based coupons
      default: null,
    },
    minOrderValue: {
      type: Number, // Optional: order should be at least this much
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number, // Total times this coupon can be used
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    userUsageLimit: {
      type: Number, // Times a single user can use
      default: 1,
    },
    applicableUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
    { timestamps: true }
);

const Coupon = model("Coupon", couponSchema);

export default Coupon;