import express from "express";
import { isLogin } from "../middlewares/isLogin.js";
import { isInfluencer } from "../middlewares/isInfluencer.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
  getReportDashboardData,
  getReportHistory,
  generateReport,
  seedDummyData
} from "../controllers/influencerReportController.js";

const router = express.Router();

router.use(isLogin);

// Influencer report routes require Influencer or Admin access
const isInfluencerOrAdmin = (req, res, next) => {
  if (req.user.role.toLowerCase() === 'influencer' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Influencer or Admin access required" });
};

router.get("/dashboard", isInfluencerOrAdmin, getReportDashboardData);
router.get("/history", isInfluencerOrAdmin, getReportHistory);
router.post("/generate", isInfluencerOrAdmin, generateReport);
router.post("/seed-dummy", isAdmin, seedDummyData); // seedDummyData should only be for admins

export default router;