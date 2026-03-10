const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const shippingManager = require('../services/shipping/shippingManager');

// @desc    Get active shipping provider info
// @route   GET /api/shipping/provider
const getActiveProvider = asyncHandler(async (req, res) => {
  const active = await shippingManager.getActiveProvider();
  if (!active) return res.json({ success: true, provider: null });
  res.json({
    success: true,
    provider: { id: active.id, displayName: active.provider.displayName },
  });
});

// @desc    Get shipping rates for a pincode/weight
// @route   POST /api/shipping/rates
const getRates = asyncHandler(async (req, res) => {
  const { pickupPincode, deliveryPincode, weight, declaredValue, cod } = req.body;
  if (!deliveryPincode || !weight) {
    res.status(400);
    throw new Error('deliveryPincode and weight are required');
  }
  const rates = await shippingManager.getRates({ pickupPincode, deliveryPincode, weight, declaredValue, cod });
  res.json({ success: true, rates });
});

// @desc    Create a shipment for an order
// @route   POST /api/shipping/create
const createShipment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) { res.status(400); throw new Error('orderId is required'); }

  const order = await Order.findById(orderId).populate('items.product', 'title sku weight');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  const shipmentData = {
    orderId: order._id.toString(),
    customerName: order.shippingAddress.fullName,
    customerEmail: req.user?.email,
    address: order.shippingAddress,
    items: order.items.map(i => ({
      title: i.title,
      sku: i.sku,
      quantity: i.quantity,
      price: i.price,
    })),
    total: order.total,
    paymentMethod: order.paymentMethod,
    weight: req.body.weight || 0.5,
    length: req.body.length,
    breadth: req.body.breadth,
    height: req.body.height,
  };

  const result = await shippingManager.createShipment(shipmentData);

  // Save tracking info on order
  const trackingId = result.awbCode || result.waybill || result.awbNumber;
  await Order.findByIdAndUpdate(orderId, {
    trackingNumber: trackingId,
    orderStatus: 'processing',
  });

  res.json({ success: true, shipment: result, trackingId });
});

// @desc    Track a shipment
// @route   GET /api/shipping/track/:trackingId
const trackShipment = asyncHandler(async (req, res) => {
  const { trackingId } = req.params;
  const result = await shippingManager.trackShipment(trackingId);
  res.json({ success: true, tracking: result });
});

module.exports = { getActiveProvider, getRates, createShipment, trackShipment };
