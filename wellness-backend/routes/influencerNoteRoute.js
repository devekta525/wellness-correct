import express from "express";
import { isLogin } from "../middleWares/isLogin.js";
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

router.post("/", createInfluencerNote);
router.get("/", getInfluencerNotes);
router.get("/:id", getInfluencerNoteById);
router.put("/:id", updateInfluencerNote);
router.delete("/:id", deleteInfluencerNote);

router.patch("/:id/favorite", toggleInfluencerNoteFavorite);

export default router;