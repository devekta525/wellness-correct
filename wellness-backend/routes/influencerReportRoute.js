import express from "express";
import { isLogin } from "../middleWares/isLogin.js";
import {
  getReportDashboardData,
  getReportHistory,
  generateReport,
  seedDummyData
} from "../controllers/influencerReportController.js";

const router = express.Router();

router.use(isLogin);

router.get("/dashboard", getReportDashboardData);
router.get("/history", getReportHistory);
router.post("/generate", generateReport);
router.post("/seed-dummy", seedDummyData);

export default router;