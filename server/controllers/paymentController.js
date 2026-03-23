const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const User = require('../models/User');
const Consultation = require('../models/Consultation');
const paymentManager = require('../services/payment/paymentManager');
const shippingManager = require('../services/shipping/shippingManager');
const { sendOrderConfirmation } = require('../services/emailService');

/** Auto-create shipment after payment is verified */
const autoCreateShipment = async (orderId) => {
  try {
    const active = await shippingManager.getActiveProvider();
    if (!active) return;
    const order = await Order.findById(orderId).populate('items.product', 'title sku weight');
    if (!order || order.trackingNumber) return;
    const result = await shippingManager.createShipment({
      orderId: order.orderNumber || order._id.toString(),
      customerName: order.shippingAddress.fullName,
      customerEmail: order.guestEmail || '',
      address: order.shippingAddress,
      items: order.items.map(i => ({ title: i.title, sku: i.sku || i.title.slice(0, 20), quantity: i.quantity, price: i.price })),
      subtotal: order.subtotal,
      total: order.total,
      paymentMethod: order.paymentMethod,
      weight: 0.5, length: 10, breadth: 10, height: 10,
    });
    const trackingId = result.awbCode || result.waybill || result.awbNumber;
    await Order.findByIdAndUpdate(orderId, {
      trackingNumber: trackingId || '',
      shippingProvider: 'shiprocket',
      shiprocketOrderId: result.orderId ? String(result.orderId) : '',
      shiprocketShipmentId: result.shipmentId ? String(result.shipmentId) : '',
      shiprocketCourierId: result.courierId ? String(result.courierId) : '',
      shiprocketCourierName: result.courierName || '',
      $push: { statusHistory: { status: 'confirmed', note: `Shiprocket shipment created${trackingId ? ` — AWB: ${trackingId}` : ''}` } },
    });
    console.log(`Shiprocket shipment created for order ${orderId}${trackingId ? ` — AWB: ${trackingId}` : ''}`);
  } catch (err) {
    console.error(`Shiprocket auto-shipment failed for order ${orderId}:`, err.message);
  }
};

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

  const order = await Order.findById(orderId).select('orderStatus user');
  const update = { paymentStatus: 'paid', paymentId: result.paymentId };
  if (order?.orderStatus === 'pending') update.orderStatus = 'confirmed';
  const updatedOrder = await Order.findByIdAndUpdate(orderId, update, { new: true });

  // Send confirmation email now that payment is verified
  if (order?.user) {
    const buyer = await User.findById(order.user);
    if (buyer && updatedOrder) {
      sendOrderConfirmation(updatedOrder, buyer).catch(() => {});
    }
  }

  // Auto-create Shiprocket shipment after successful payment
  autoCreateShipment(orderId).catch(() => {});

  res.json({ success: true, verified: true, paymentId: result.paymentId });
});

// @desc    PayU payment response (form POST from PayU) – orders and consultations
// @route   POST /api/payments/payu/response
// txnid format: Wellness_fuel_{orderId}_{timestamp} or Wellness_fuel_consult_{consultationId}_{timestamp}
const payuResponse = asyncHandler(async (req, res) => {
  const { txnid, status, mihpayid, amount, productinfo, firstname, email, hash } = req.body;
  const parts = txnid?.split('_') || [];
  const isConsultation = parts[1] === 'consult';
  const consultationId = isConsultation ? parts[2] : null;
  const orderId = isConsultation ? null : parts[1];

  try {
    await paymentManager.verifyPayment('payu', { txnid, status, mihpayid, amount, productinfo, firstname, email, hash });
    if (isConsultation && consultationId) {
      await Consultation.findByIdAndUpdate(consultationId, {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentId: mihpayid,
      });
      res.redirect(`${req.protocol}://${req.get('host')}/my-consultations?booked=1`);
      return;
    }
    if (orderId) {
      const order = await Order.findById(orderId).select('orderStatus user');
      const update = { paymentStatus: 'paid', paymentId: mihpayid };
      if (order?.orderStatus === 'pending') update.orderStatus = 'confirmed';
      const updatedOrder = await Order.findByIdAndUpdate(orderId, update, { new: true });

      // Send confirmation email now that PayU payment succeeded
      if (order?.user) {
        const buyer = await User.findById(order.user);
        if (buyer && updatedOrder) {
          sendOrderConfirmation(updatedOrder, buyer).catch(() => {});
        }
      }

      autoCreateShipment(orderId).catch(() => {});
    }
    res.redirect(`${req.protocol}://${req.get('host')}/order-confirmation/${orderId}?payment=success`);
  } catch (err) {
    if (isConsultation && consultationId) {
      await Consultation.findByIdAndUpdate(consultationId, { paymentStatus: 'failed' });
      res.redirect(`${req.protocol}://${req.get('host')}/consultation?payment=failed&reason=${encodeURIComponent(err.message)}`);
    } else if (orderId) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
      res.redirect(`${req.protocol}://${req.get('host')}/checkout?payment=failed&reason=${encodeURIComponent(err.message)}`);
    } else {
      res.redirect(`${req.protocol}://${req.get('host')}/checkout?payment=failed&reason=${encodeURIComponent(err.message)}`);
    }
  }
});

// @desc    Razorpay webhook — verify signature and update order to Paid
// @route   POST /api/payments/razorpay/webhook
// Body must be raw for signature verification (mount with express.raw()).
const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body; // Buffer when using express.raw()
  if (!signature || !rawBody) {
    res.status(400).json({ error: 'Missing signature or body' });
    return;
  }
  const paymentManager = require('../services/payment/paymentManager');
  const crypto = require('crypto');
  const { loadGatewayConfig, GATEWAYS } = paymentManager;
  const stored = await loadGatewayConfig('razorpay');
  const razorpayGw = GATEWAYS.razorpay;
  const resolved = razorpayGw.resolveConfig(stored?.config);
  const webhookSecret = resolved.webhook_secret || resolved.key_secret;
  if (!webhookSecret) {
    res.status(500).json({ error: 'Webhook secret not configured' });
    return;
  }
  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  if (expected !== signature) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }
  const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : (rawBody.length ? JSON.parse(rawBody.toString()) : {});
  const event = payload.event;
  if (event !== 'payment.captured') {
    res.json({ received: true });
    return;
  }
  const payment = payload.payload?.payment?.entity;
  if (!payment) {
    res.json({ received: true });
    return;
  }
  const orderId = payment.notes?.orderId || (payment.order_id && payment.order_id.split('_').pop());
  if (!orderId) {
    res.json({ received: true });
    return;
  }
  const order = await Order.findById(orderId).select('orderStatus paymentStatus user');
  if (order && order.paymentStatus !== 'paid') {
    const update = { paymentStatus: 'paid', paymentId: payment.id };
    if (order.orderStatus === 'pending') update.orderStatus = 'confirmed';
    const updatedOrder = await Order.findByIdAndUpdate(orderId, update, { new: true });

    // Send confirmation email now that Razorpay payment is captured
    if (order.user) {
      const buyer = await User.findById(order.user);
      if (buyer && updatedOrder) {
        sendOrderConfirmation(updatedOrder, buyer).catch(() => {});
      }
    }

    // Auto-create Shiprocket shipment after webhook payment
    autoCreateShipment(orderId).catch(() => {});
  }
  res.json({ received: true });
});

module.exports = { getActiveGateways, createPaymentOrder, verifyPayment, payuResponse, razorpayWebhook };
