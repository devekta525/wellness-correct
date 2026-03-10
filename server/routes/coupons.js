const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { validateCoupon } = require('../controllers/couponController');

router.post('/validate', optionalAuth, validateCoupon);

module.exports = router;
