import mongoose from "mongoose";

const audienceInsightSchema = new mongoose.Schema(
  {
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    demographicType: {
      type: String,
      enum: ["age", "gender", "location"],
      required: true
    },
    label: { type: String, required: true },
    count: { type: Number, required: true },
    percentage: { type: Number, required: true },
    trend: {
      type: String,
      enum: ["up", "down", "stable"],
      default: "stable"
    }
  },
  { timestamps: true }
);

export default mongoose.model("AudienceInsight", audienceInsightSchema);