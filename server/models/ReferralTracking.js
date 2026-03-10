const mongoose = require('mongoose');

const referralTrackingSchema = new mongoose.Schema({
  referralCode: { type: mongoose.Schema.Types.ObjectId, ref: 'ReferralCode', required: true },
  code: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  type: { type: String, enum: ['click', 'conversion'], default: 'click' },
  // Visitor info
  sessionId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ip: String,
  ipHash: String,
  userAgent: String,
  device: { type: String, enum: ['mobile', 'tablet', 'desktop', 'bot', 'unknown'], default: 'unknown' },
  browser: String,
  os: String,
  country: String,
  city: String,
  // Referrer
  referrer: String,
  landingPage: String,
  // Attribution
  attributionModel: { type: String, enum: ['first_click', 'last_click'], default: 'last_click' },
  // Conversion data (if converted)
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  orderValue: Number,
  commissionAmount: Number,
  commissionPaid: { type: Boolean, default: false },
  // Fraud detection
  isSuspicious: { type: Boolean, default: false },
  suspicionReasons: [String],
  isBot: { type: Boolean, default: false },
  isDuplicate: { type: Boolean, default: false },
}, { timestamps: true });

referralTrackingSchema.index({ code: 1 });
referralTrackingSchema.index({ referralCode: 1 });
referralTrackingSchema.index({ userId: 1 });
referralTrackingSchema.index({ sessionId: 1 });
referralTrackingSchema.index({ ip: 1, createdAt: -1 });
referralTrackingSchema.index({ type: 1 });
referralTrackingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ReferralTracking', referralTrackingSchema);
