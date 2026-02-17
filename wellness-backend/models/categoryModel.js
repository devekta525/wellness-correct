import  { model, Schema  } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null, // root category
    },
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      maxlength: 160, // SEO limit
      
    },
  },
  { timestamps: true }
);

const Category= model("Category", categorySchema);

export default Category