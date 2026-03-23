const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { getActiveProvider, getRates, createShipment, trackShipment, shiprocketWebhook } = require('../controllers/shippingController');

router.get('/provider', getActiveProvider);
router.post('/rates', getRates);
router.get('/track/:trackingId', trackShipment);

// Admin only: create shipment for an order
router.post('/create', protect, admin, createShipment);

// Shiprocket webhook — public endpoint (no auth, Shiprocket calls this)
router.post('/shiprocket/webhook', shiprocketWebhook);

module.exports = router;
