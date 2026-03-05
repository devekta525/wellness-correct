import express from "express";
import {
    getBanners,
    createBanner,
    deleteBanner,
} from "../controllers/bannerController.js";
import { upload } from "../config/s3Config.js";
import { isLogin } from "../middleware/isLogin.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Get all banners
router.get("/", getBanners);

// Create Banner (multiple images)
router.post("/", isLogin, isAdmin, upload.array("images", 4), createBanner);

// Delete Banner
router.delete("/:id", isLogin, isAdmin, deleteBanner);

export default router;
