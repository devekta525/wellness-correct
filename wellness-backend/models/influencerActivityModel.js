import mongoose from "mongoose";

const influencerActivitySchema = new mongoose.Schema(
  {
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: [
        "referral_earned",
        "post_published",
        "campaign_completed",
        "payment_received",
        "new_follower"
      ],
      required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    iconType: { type: String, default: "Activity" },
    color: { type: String, default: "blue" },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

influencerActivitySchema.index({ influencerId: 1, createdAt: -1 });

export default mongoose.model("InfluencerActivity", influencerActivitySchema);