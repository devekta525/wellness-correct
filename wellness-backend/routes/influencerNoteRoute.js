import express from "express";
import { isLogin } from "../middlewares/isLogin.js";
import { isInfluencer } from "../middlewares/isInfluencer.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
  createInfluencerNote,
  getInfluencerNotes,
  getInfluencerNoteById,
  updateInfluencerNote,
  deleteInfluencerNote,
  toggleInfluencerNoteFavorite
} from "../controllers/influencerNoteController.js";

const router = express.Router();

router.use(isLogin);

// Influencer note routes require Influencer or Admin access
const isInfluencerOrAdmin = (req, res, next) => {
  if (req.user.role.toLowerCase() === 'influencer' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Influencer or Admin access required" });
};

router.post("/", isInfluencerOrAdmin, createInfluencerNote);
router.get("/", isInfluencerOrAdmin, getInfluencerNotes);
router.get("/:id", isInfluencerOrAdmin, getInfluencerNoteById);
router.put("/:id", isInfluencerOrAdmin, updateInfluencerNote);
router.delete("/:id", isInfluencerOrAdmin, deleteInfluencerNote);
router.patch("/:id/favorite", isInfluencerOrAdmin, toggleInfluencerNoteFavorite);

export default router;