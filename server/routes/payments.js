const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { getActiveGateways, createPaymentOrder, verifyPayment, payuResponse } = require('../controllers/paymentController');

// Public: get active gateways
router.get('/gateways', getActiveGateways);

// Auth optional: create payment order & verify (guest checkout supported)
router.post('/order', optionalAuth, createPaymentOrder);
router.post('/verify', optionalAuth, verifyPayment);

// PayU redirects here after payment (no auth – it's a form POST from PayU servers)
router.post('/payu/response', payuResponse);

module.exports = router;
