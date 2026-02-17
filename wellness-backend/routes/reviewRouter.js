import { Router } from "express";
import { createReview, deleteReview, getReviewById, listReviews, setReviewStatus, updateReview } from "../controllers/reviewController.js";
import { upload } from "../config/s3Config.js";


const router = Router();

// Public create (or protect as needed)
router.post('/',upload.array("images", 5), createReview);

// Admin/public listing
router.get('/', listReviews);

// Single item
router.get('/:id', getReviewById);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

// Moderation
router.patch('/:id/status', setReviewStatus);

export default router;
