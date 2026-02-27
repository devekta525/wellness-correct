import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
    {
        imageUrl: {
            type: String,
            required: true,
        },
        order: {
            type: Number,
            default: 0,
        }
    },
    { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
