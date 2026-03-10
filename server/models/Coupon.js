const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: String,
  type: { type: String, enum: ['percentage', 'fixed', 'free_shipping'], required: true },
  value: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: Number,
  usageLimit: { type: Number, default: null },
  usageCount: { type: Number, default: 0 },
  userLimit: { type: Number, default: 1 },
  usedBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, usedAt: Date }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  isActive: { type: Boolean, default: true },
  startDate: Date,
  expiresAt: { type: Date, required: true },
  isFirstOrderOnly: { type: Boolean, default: false },
}, { timestamps: true });

couponSchema.index({ isActive: 1, expiresAt: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
