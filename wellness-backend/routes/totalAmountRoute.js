import { Router } from "express";
import { getTotalSpentAmount } from "../controllers/amountController.js";
import { isLogin } from "../middlewares/isLogin.js";

const router = Router();

router.get("/", isLogin, getTotalSpentAmount);

export default router;
