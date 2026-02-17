import { Router } from "express";
import { createRating, deleteRating, getRatingById, getRatings, updateRating } from "../controllers/ratingController.js";

const router=Router();

router.get("/",getRatings);
router.get("/:id",getRatingById);


router.post("/",createRating);


router.put("/:id",updateRating);

router.delete("/:id",deleteRating);


export default router;