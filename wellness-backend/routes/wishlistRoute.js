import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getMyWishlist,
} from "../controllers/wishlistController.js";
import { isLogin } from "../middleWares/isLogin.js";

const router = express.Router();

// Protect all routes
router.use(isLogin);

router.post("/add", addToWishlist);
router.delete("/remove/:productId", removeFromWishlist);
router.get("/my-wishlist", getMyWishlist);

export default router;