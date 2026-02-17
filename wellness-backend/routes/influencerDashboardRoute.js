import express from "express";
import { isLogin } from "../middleWares/isLogin.js";
import {
  getDashboardData,
  createActivity
} from "../controllers/influencerDashboardController.js";

const router = express.Router();

router.use(isLogin);

router.get("/", getDashboardData);
router.post("/activity", createActivity);

export default router;