const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { syncCart } = require('../controllers/abandonedCartController');
const { recordClick } = require('../controllers/clickTrackingController');

// POST /api/tracking/cart — requires auth (sync logged-in user's cart)
router.post('/cart', protect, syncCart);

// POST /api/tracking/click — optional auth (works for guests too)
router.post('/click', optionalAuth, recordClick);

module.exports = router;
