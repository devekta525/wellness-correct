import express from "express";
import { isLogin } from "../middleware/isLogin.js";
import { isInfluencer } from "../middleware/isInfluencer.js";
import { isAdmin } from "../middleware/isAdmin.js";
import {
  getInfluencerSettings,
  updateProfileSettings,
  updateBusinessSettings,
  updateSecuritySettings,
  updateAvatar
} from "../controllers/influencerSettingsController.js";

const router = express.Router();

router.use(isLogin);

// All influencer settings routes require influencer or admin role
router.get("/", (req, res, next) => {
  if (req.user.role.toLowerCase() === 'influencer' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Influencer or Admin access required" });
}, getInfluencerSettings);

router.put("/profile", (req, res, next) => {
  if (req.user.role.toLowerCase() === 'influencer' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Influencer or Admin access required" });
}, updateProfileSettings);

router.put("/business", (req, res, next) => {
  if (req.user.role.toLowerCase() === 'influencer' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Influencer or Admin access required" });
}, updateBusinessSettings);

router.put("/security", (req, res, next) => {
  if (req.user.role.toLowerCase() === 'influencer' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Influencer or Admin access required" });
}, updateSecuritySettings);

router.put("/avatar", (req, res, next) => {
  if (req.user.role.toLowerCase() === 'influencer' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Influencer or Admin access required" });
}, updateAvatar);

export default router;