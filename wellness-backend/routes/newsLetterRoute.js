import { Router } from "express";
import { createSubscription, deleteSubscription, getSubscriptionById, getSubscriptions, updateSubscriptionStatus } from "../controllers/newsLetterController.js";

const router = Router();

router.get("/", getSubscriptions);
router.post("/", createSubscription);
router.put("/:id", updateSubscriptionStatus);
router.delete("/:id", deleteSubscription);
router.get("/:id", getSubscriptionById);



export default router;
