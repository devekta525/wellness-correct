const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { createOrder, getMyOrders, getOrder } = require('../controllers/orderController');

router.post('/', optionalAuth, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrder);

module.exports = router;
