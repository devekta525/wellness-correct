const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: mongoose.Schema.Types.Mixed,
  sku: String,
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail: String,
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'wallet', 'netbanking', 'cod', 'stripe', 'razorpay', 'payu', 'cashfree'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  paymentId: String,
  stripePaymentIntentId: String,
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'confirmed',
  },
  statusHistory: [{
    status: String,
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
  }],
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  couponCode: String,
  // Referral tracking
  referralCode: String,
  referralTracking: { type: mongoose.Schema.Types.ObjectId, ref: 'ReferralTracking' },
  // Shipping
  shippingMethod: { type: String, default: 'standard' },
  trackingNumber: String,
  shippingProvider: String,
  shiprocketOrderId: String,
  shiprocketShipmentId: String,
  shiprocketCourierId: String,
  shiprocketCourierName: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  notes: String,
  invoiceUrl: String,
}, { timestamps: true });

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const prefix = `ABS${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    this.orderNumber = `${prefix}${random}`;
  }
  next();
});

orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ referralCode: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
