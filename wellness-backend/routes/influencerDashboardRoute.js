import express from "express";
import { isLogin } from "../middleWares/isLogin.js";
import { isInfluencer } from "../middleWares/isInfluencer.js";
import { isAdmin } from "../middleWares/isAdmin.js";
import {
  getDashboardData,
  createActivity
} from "../controllers/influencerDashboardController.js";

const router = express.Router();

router.use(isLogin);

// Influencer dashboard requires Influencer or Admin role
const isInfluencerOrAdmin = (req, res, next) => {
  if (req.user.role.toLowerCase() === 'influencer' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Influencer or Admin access required" });
};

router.get("/", isInfluencerOrAdmin, getDashboardData);
router.post("/activity", isInfluencerOrAdmin, createActivity);

export default router;