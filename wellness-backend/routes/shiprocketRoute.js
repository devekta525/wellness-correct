import express from "express";
import { shiprocketWebhook } from "../controllers/shiprocketWebhookController.js";

const router = express.Router();

router.post("/shiprocket", shiprocketWebhook);

export default router;



