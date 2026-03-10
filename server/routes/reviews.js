const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReview, getProductReviews, getRecentReviews } = require('../controllers/reviewController');

router.post('/', protect, createReview);
router.get('/recent', getRecentReviews);
router.get('/product/:productId', getProductReviews);

module.exports = router;
