const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');
const { trackConversion } = require('../services/referralService');
const { sendOrderConfirmation } = require('../services/emailService');

// Lazy Stripe – avoids crashing if key is missing/placeholder
let _stripe = null;
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!_stripe && key && key.startsWith('sk_')) {
    _stripe = require('stripe')(key);
  }
  return _stripe;
};

// @desc    Create order
// @route   POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode, referralCode } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Calculate prices & validate stock
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) { res.status(404); throw new Error(`Product ${item.product} not found`); }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.title}`);
    }

    const price = product.comparePrice && product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price;

    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.thumbnail || product.images[0]?.url,
      price,
      quantity: item.quantity,
      sku: product.sku,
      variant: item.variant,
    });
    subtotal += price * item.quantity;
  }

  // Coupon validation
  let discount = 0;
  let couponDoc = null;

  if (couponCode) {
    couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true, expiresAt: { $gt: new Date() } });
    if (couponDoc) {
      if (subtotal >= couponDoc.minOrderAmount) {
        if (couponDoc.type === 'percentage') {
          discount = (subtotal * couponDoc.value) / 100;
          if (couponDoc.maxDiscount) discount = Math.min(discount, couponDoc.maxDiscount);
        } else if (couponDoc.type === 'fixed') {
          discount = couponDoc.value;
        }
      }
    }
  }

  const [freeShippingThreshold, standardShippingCost, taxRatePercent] = await Promise.all([
    Settings.get('free_shipping_threshold', 999),
    Settings.get('standard_shipping_cost', 49),
    Settings.get('tax_rate', 18),
  ]);
  const num = (v) => { const n = Number(v); return ((n === 0 || n) && !Number.isNaN(n)) ? n : null; };
  const threshold = num(freeShippingThreshold) ?? 999;
  const shippingRate = num(standardShippingCost) ?? 49;
  const taxRatePercentVal = num(taxRatePercent) ?? 18;
  const taxRate = taxRatePercentVal / 100;
  const shippingCost = subtotal >= threshold ? 0 : shippingRate;
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + shippingCost + tax;

  // COD = confirmed; online payment = pending until paid
  const isCod = paymentMethod === 'cod';
  const initialOrderStatus = isCod ? 'confirmed' : 'pending';
  const statusNote = isCod ? 'Order placed successfully' : 'Order created; awaiting payment';

  const order = await Order.create({
    user: req.user?._id,
    guestEmail: req.body.guestEmail,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    orderStatus: initialOrderStatus,
    subtotal: Math.round(subtotal * 100) / 100,
    shippingCost,
    tax: Math.round(tax * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
    coupon: couponDoc?._id,
    couponCode: couponDoc?.code,
    referralCode: referralCode?.toUpperCase(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    statusHistory: [{ status: initialOrderStatus, note: statusNote }],
  });

  // Update stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, totalSales: item.quantity },
    });
  }

  // Update coupon usage
  if (couponDoc) {
    await Coupon.findByIdAndUpdate(couponDoc._id, {
      $inc: { usageCount: 1 },
      $push: { usedBy: { user: req.user?._id, usedAt: new Date() } },
    });
  }

  // Track referral conversion
  if (referralCode) {
    await trackConversion({
      code: referralCode,
      orderId: order._id,
      orderValue: total,
      userId: req.user?._id,
    }).catch(e => console.log('Referral tracking error:', e.message));
  }

  // Send confirmation email
  if (req.user) {
    await sendOrderConfirmation(order, req.user).catch(() => {});
  }

  // Create Stripe payment intent if card/stripe payment
  if (paymentMethod === 'stripe' || paymentMethod === 'card') {
    const stripeClient = getStripe();
    if (stripeClient) {
      try {
        const paymentIntent = await stripeClient.paymentIntents.create({
          amount: Math.round(total * 100),
          currency: 'inr',
          metadata: { orderId: order._id.toString() },
        });
        await Order.findByIdAndUpdate(order._id, { stripePaymentIntentId: paymentIntent.id });
        return res.status(201).json({ success: true, order, clientSecret: paymentIntent.client_secret });
      } catch (stripeErr) {
        console.error('Stripe error:', stripeErr.message);
      }
    }
  }

  res.status(201).json({ success: true, order });
});

// @desc    Get my orders
// @route   GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('items.product', 'title thumbnail slug');

  res.json({ success: true, orders, pagination: { page: Number(page), limit: Number(limit), total } });
});

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'title thumbnail slug')
    .populate('user', 'name email phone');

  if (!order) { res.status(404); throw new Error('Order not found'); }

  if (req.user.role === 'customer' && order.user?._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, order });
});

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.orderStatus = status;
  order.statusHistory.push({ status, note, updatedBy: req.user._id });
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === 'delivered') order.deliveredAt = new Date();
  if (status === 'cancelled') order.cancelledAt = new Date();

  await order.save();
  res.json({ success: true, order });
});

// @desc    Update payment status (admin/webhook)
// @route   PUT /api/admin/orders/:id/payment
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status, paymentId } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { paymentStatus: status, paymentId },
    { new: true }
  );
  res.json({ success: true, order });
});

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, paymentStatus, search, startDate, endDate } = req.query;
  const query = {};

  if (status) query.orderStatus = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (search) query.orderNumber = { $regex: search, $options: 'i' };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({ success: true, orders, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

module.exports = { createOrder, getMyOrders, getOrder, updateOrderStatus, updatePaymentStatus, getAllOrders };
