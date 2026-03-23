const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const User = require('../models/User');
const shippingManager = require('../services/shipping/shippingManager');
const { sendEmail } = require('../services/emailService');

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

// ─── Shiprocket status → our orderStatus mapping ───
const SHIPROCKET_STATUS_MAP = {
  // Pickup
  6:  'packed',            // Shipped — Picked Up
  19: 'packed',            // Out For Pickup
  // In Transit
  18: 'shipped',           // In Transit
  17: 'shipped',           // Reached at Destination Hub
  38: 'shipped',           // Reached Warehouse
  // Out for Delivery
  20: 'out_for_delivery',  // Out For Delivery
  // Delivered
  7:  'delivered',         // Delivered
  // RTO / Returned
  9:  'returned',          // RTO Initiated
  10: 'returned',          // RTO Delivered
  14: 'returned',          // RTO Acknowledged
  // Cancelled
  8:  'cancelled',         // Cancelled
  // Failed
  21: 'shipped',           // Undelivered (reattempt, stays shipped)
  12: 'shipped',           // Lost
};

// @desc    Shiprocket webhook — receive real-time shipment status updates
// @route   POST /api/shipping/shiprocket/webhook
const shiprocketWebhook = asyncHandler(async (req, res) => {
  const data = req.body;

  console.log('Shiprocket webhook received:', JSON.stringify(data, null, 2));

  // Shiprocket sends: awb, current_status, current_status_id, order_id, etd, etc.
  const srOrderId = data.order_id;
  const awb = data.awb;
  const currentStatus = data.current_status;
  const currentStatusId = Number(data.current_status_id);
  const etd = data.etd; // estimated delivery date

  if (!srOrderId && !awb) {
    return res.status(200).send('OK — no order_id or awb');
  }

  // Find the order by trackingNumber (AWB) or by orderNumber matching Shiprocket order_id
  let order;
  if (awb) {
    order = await Order.findOne({ trackingNumber: awb });
  }
  if (!order && srOrderId) {
    // Shiprocket order_id could be our MongoDB _id or orderNumber
    order = await Order.findById(srOrderId).catch(() => null);
    if (!order) {
      order = await Order.findOne({ orderNumber: srOrderId });
    }
  }

  if (!order) {
    console.log(`Shiprocket webhook: no order found for order_id=${srOrderId}, awb=${awb}`);
    return res.status(200).send('OK — order not found');
  }

  // Map Shiprocket status to our orderStatus
  const newStatus = SHIPROCKET_STATUS_MAP[currentStatusId];

  const updateFields = {};

  // Update AWB/tracking if we didn't have it
  if (awb && !order.trackingNumber) {
    updateFields.trackingNumber = awb;
  }

  // Update estimated delivery if provided
  if (etd) {
    const etdDate = new Date(etd);
    if (!isNaN(etdDate.getTime())) {
      updateFields.estimatedDelivery = etdDate;
    }
  }

  // Update order status if we have a valid mapping and it's a meaningful progression
  if (newStatus && newStatus !== order.orderStatus) {
    updateFields.orderStatus = newStatus;

    if (newStatus === 'delivered') {
      updateFields.deliveredAt = new Date();
    }
    if (newStatus === 'cancelled') {
      updateFields.cancelledAt = new Date();
      updateFields.cancellationReason = `Shiprocket: ${currentStatus}`;
    }
  }

  // Always push to statusHistory for audit trail
  const historyEntry = {
    status: newStatus || order.orderStatus,
    note: `Shiprocket: ${currentStatus} (status_id: ${currentStatusId})${awb ? ` | AWB: ${awb}` : ''}`,
    updatedAt: new Date(),
  };

  await Order.findByIdAndUpdate(order._id, {
    ...updateFields,
    $push: { statusHistory: historyEntry },
  });

  // Send email notifications for key status changes
  if (newStatus && newStatus !== order.orderStatus) {
    const user = order.user ? await User.findById(order.user) : null;
    const email = user?.email || order.guestEmail;

    if (email) {
      const emailTemplates = {
        shipped: {
          subject: `Your order #${order.orderNumber} has been shipped!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6366f1;">Your Order is on the Way!</h2>
              <p>Hi ${user?.name || 'there'}, your order <strong>#${order.orderNumber}</strong> has been shipped.</p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Tracking Number:</strong> ${awb || order.trackingNumber}</p>
                <p><strong>Status:</strong> ${currentStatus}</p>
                ${etd ? `<p><strong>Estimated Delivery:</strong> ${etd}</p>` : ''}
              </div>
              <p>Thank you for shopping with <strong>Wellness_fuel</strong>!</p>
            </div>`,
        },
        out_for_delivery: {
          subject: `Your order #${order.orderNumber} is out for delivery!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6366f1;">Almost There!</h2>
              <p>Hi ${user?.name || 'there'}, your order <strong>#${order.orderNumber}</strong> is out for delivery.</p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Tracking Number:</strong> ${awb || order.trackingNumber}</p>
              </div>
              <p>Please be available to receive your package.</p>
            </div>`,
        },
        delivered: {
          subject: `Your order #${order.orderNumber} has been delivered!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6366f1;">Order Delivered!</h2>
              <p>Hi ${user?.name || 'there'}, your order <strong>#${order.orderNumber}</strong> has been delivered.</p>
              <p>We hope you enjoy your purchase! If you have any concerns, please contact our support team.</p>
              <p>Thank you for shopping with <strong>Wellness_fuel</strong>!</p>
            </div>`,
        },
        returned: {
          subject: `Order #${order.orderNumber} — Return Initiated`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">Return Initiated</h2>
              <p>Hi ${user?.name || 'there'}, your order <strong>#${order.orderNumber}</strong> is being returned to the seller.</p>
              <p><strong>Reason:</strong> ${currentStatus}</p>
              <p>If you have questions, please contact our support team.</p>
            </div>`,
        },
      };

      const template = emailTemplates[newStatus];
      if (template) {
        sendEmail({ to: email, ...template }).catch(() => {});
      }
    }
  }

  console.log(`Shiprocket webhook processed: order=${order.orderNumber}, status=${currentStatus} → ${newStatus || '(no change)'}`);
  res.status(200).send('OK');
});

module.exports = { getActiveProvider, getRates, createShipment, trackShipment, shiprocketWebhook };
