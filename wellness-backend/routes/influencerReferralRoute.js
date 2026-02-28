import express from "express";
import { isLogin } from "../middlewares/isLogin.js";
import { isInfluencer } from "../middlewares/isInfluencer.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
  getReferralDashboardData,
  createDummyReferral
} from "../controllers/influencerReferralController.js";

const router = express.Router();

// Influencer referral routes require Influencer or Admin access
const isInfluencerOrAdmin = (req, res, next) => {
  if (req.user.role.toLowerCase() === 'influencer' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Influencer or Admin access required" });
};

router.get("/dashboard", isLogin, isInfluencerOrAdmin, getReferralDashboardData);
router.post("/create-dummy", isLogin, isAdmin, createDummyReferral); // Only admins can create dummy data

export default router;