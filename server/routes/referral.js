const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { trackReferralClick } = require('../controllers/referralController');

router.post('/track', optionalAuth, trackReferralClick);

module.exports = router;
