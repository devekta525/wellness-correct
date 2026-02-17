import mongoose from "mongoose";

const influencerMetricSchema = new mongoose.Schema(
  {
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    postsCount: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  { timestamps: true }
);

influencerMetricSchema.index({ influencerId: 1, date: -1 });

export default mongoose.model("InfluencerMetric", influencerMetricSchema);