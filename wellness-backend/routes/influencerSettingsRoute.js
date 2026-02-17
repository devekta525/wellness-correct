import express from "express";
import { isLogin } from "../middleWares/isLogin.js";
import {
  getInfluencerSettings,
  updateProfileSettings,
  updateBusinessSettings,
  updateSecuritySettings,
  updateAvatar
} from "../controllers/influencerSettingsController.js";

const router = express.Router();

router.use(isLogin);

router.get("/", getInfluencerSettings);

router.put("/profile", updateProfileSettings);
router.put("/business", updateBusinessSettings);
router.put("/security", updateSecuritySettings);
router.put("/avatar", updateAvatar);

export default router;