import Banner from "../models/bannerModel.js";
import { uploadFile, deleteOldImage, upload } from "../config/s3Config.js";

// @desc    Get all banners
// @route   GET /api/v1/banners
// @access  Public
export const getBanners = async (req, res) => {
    try {
        const banners = await Banner.find({}).sort({ order: 1 });
        res.status(200).json({ success: true, data: banners });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Create a new banner
// @route   POST /api/v1/banners
// @access  Private/Admin
export const createBanner = async (req, res) => {
    try {
        // Check limit
        const count = await Banner.countDocuments();
        const incomingFiles = req.files || [];

        if (incomingFiles.length === 0) {
            return res.status(400).json({ success: false, message: "Please upload at least one image." });
        }

        if (count + incomingFiles.length > 4) {
            return res.status(400).json({ success: false, message: `Maximum 4 banners allowed. You can only upload ${4 - count} more.` });
        }

        const uploadedBanners = [];

        // Upload all files and save concurrently
        const uploadPromises = incomingFiles.map(async (file, index) => {
            try {
                const finalImageUrl = await uploadFile(file);
                const banner = await Banner.create({
                    imageUrl: finalImageUrl,
                    order: count + index,
                });
                uploadedBanners.push(banner);
            } catch (error) {
                console.error("Failed to upload an image:", error.message);
                throw error; // Will be caught by outer catch block
            }
        });

        await Promise.all(uploadPromises);

        res.status(201).json({ success: true, data: uploadedBanners, message: "Banners uploaded successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Delete a banner
// @route   DELETE /api/v1/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        // Delete image from storage
        if (banner.imageUrl) {
            try {
                await deleteOldImage(banner.imageUrl);
            } catch (error) {
                console.error("Failed to delete banner image:", error.message);
            }
        }

        await Banner.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: "Banner removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
