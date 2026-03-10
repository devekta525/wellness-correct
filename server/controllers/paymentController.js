const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const paymentManager = require('../services/payment/paymentManager');

// @desc    Get all active payment gateways (public config only)
// @route   GET /api/payments/gateways
const getActiveGateways = asyncHandler(async (req, res) => {
  const gateways = await paymentManager.getActiveGateways();
  res.json({ success: true, gateways });
});

// @desc    Create a payment order for a specific gateway
// @route   POST /api/payments/order
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { gatewayId, orderId } = req.body;
  if (!gatewayId || !orderId) {
    res.status(400);
    throw new Error('gatewayId and orderId are required');
  }

  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  // Only the order owner (or admin) can initiate payment
  if (req.user && order.user && req.user.role === 'customer' && order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const customerInfo = {
    name: order.shippingAddress?.fullName || 'Customer',
    email: req.user?.email || order.guestEmail || 'customer@Wellness_fuel.com',
    phone: order.shippingAddress?.phone,
  };

  const paymentOrder = await paymentManager.createOrder(gatewayId, {
    amount: order.total,
    orderId: order._id.toString(),
    currency: 'INR',
    customerInfo,
  });

  // Store the gateway being used on the order
  await Order.findByIdAndUpdate(orderId, { paymentMethod: gatewayId });

  res.json({ success: true, paymentOrder });
});

// @desc    Verify payment and mark order as paid
// @route   POST /api/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { gatewayId, orderId, ...payload } = req.body;
  if (!gatewayId || !orderId) {
    res.status(400);
    throw new Error('gatewayId and orderId are required');
  }

  const result = await paymentManager.verifyPayment(gatewayId, payload);

  const order = await Order.findById(orderId).select('orderStatus');
  const update = { paymentStatus: 'paid', paymentId: result.paymentId };
  if (order?.orderStatus === 'pending') update.orderStatus = 'confirmed';
  await Order.findByIdAndUpdate(orderId, update);

  res.json({ success: true, verified: true, paymentId: result.paymentId });
});

// @desc    PayU payment response (form POST from PayU)
// @route   POST /api/payments/payu/response
const payuResponse = asyncHandler(async (req, res) => {
  const { txnid, status, mihpayid, amount, productinfo, firstname, email, hash } = req.body;

  // Extract our order ID from txnid (format: Wellness_fuel_{orderId}_{timestamp})
  const parts = txnid?.split('_');
  const orderId = parts?.[1];

  try {
    const result = await paymentManager.verifyPayment('payu', { txnid, status, mihpayid, amount, productinfo, firstname, email, hash });
    if (orderId) {
      const order = await Order.findById(orderId).select('orderStatus');
      const update = { paymentStatus: 'paid', paymentId: mihpayid };
      if (order?.orderStatus === 'pending') update.orderStatus = 'confirmed';
      await Order.findByIdAndUpdate(orderId, update);
    }
    // Redirect to success page
    res.redirect(`/order-confirmation/${orderId}?payment=success`);
  } catch (err) {
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
    }
    res.redirect(`/checkout?payment=failed&reason=${encodeURIComponent(err.message)}`);
  }
});

module.exports = { getActiveGateways, createPaymentOrder, verifyPayment, payuResponse };
