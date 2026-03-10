const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { getActiveProvider, getRates, createShipment, trackShipment } = require('../controllers/shippingController');

router.get('/provider', getActiveProvider);
router.post('/rates', getRates);
router.get('/track/:trackingId', trackShipment);

// Admin only: create shipment for an order
router.post('/create', protect, admin, createShipment);

module.exports = router;
