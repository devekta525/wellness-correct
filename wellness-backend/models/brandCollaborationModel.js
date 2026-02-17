import mongoose from "mongoose";

const brandCollaborationSchema = new mongoose.Schema(
  {
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    brandName: { type: String, required: true },
    postsCount: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "completed", "pending"],
      default: "pending"
    },
    startDate: Date,
    endDate: Date
  },
  { timestamps: true }
);

export default mongoose.model("BrandCollaboration", brandCollaborationSchema);