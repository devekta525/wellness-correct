import { model, Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    status:{ type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    imageUrl:[ { type: String }],
    title:{ type: String, required: true, maxlength: 100 },
    review: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

const Review = model("Review", reviewSchema);

export default Review;
