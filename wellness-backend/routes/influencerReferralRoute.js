import express from "express";
import { isLogin } from "../middleWares/isLogin.js";
import { 
  getReferralDashboardData,
  createDummyReferral 
} from "../controllers/influencerReferralController.js";

const router = express.Router();

router.get("/dashboard", isLogin, getReferralDashboardData);
router.post("/create-dummy", createDummyReferral);

export default router;