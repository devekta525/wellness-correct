import mongoose from "mongoose";

const influencerNoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true
    },
    content: {
      type: String,
      required: [true, "Content is required"]
    },
    category: {
      type: String,
      enum: ["Work", "Learning", "Personal", "Ideas", "Meeting"],
      default: "Personal"
    },
    tags: [{
      type: String,
      trim: true
    }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Influencer",
      required: true
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft"
    }
  },
  { timestamps: true }
);

influencerNoteSchema.index({ title: "text", content: "text", tags: "text" });

const InfluencerNote = mongoose.model("InfluencerNote", influencerNoteSchema);

export default InfluencerNote;