const mongoose = require('mongoose');

const referralCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerName: String,
  ownerType: { type: String, enum: ['affiliate', 'influencer', 'store', 'campaign', 'admin', 'custom'], default: 'campaign' },
  // Settings
  isActive: { type: Boolean, default: true },
  expiresAt: Date,
  usageLimit: { type: Number, default: null },
  usageCount: { type: Number, default: 0 },
  // Commission
  commissionRate: { type: Number, default: 0 },
  commissionType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  // Aggregated stats (denormalized for performance)
  stats: {
    clicks: { type: Number, default: 0 },
    uniqueClicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    lastClickAt: Date,
    lastConversionAt: Date,
  },
  customUrl: String,
  notes: String,
  tags: [String],
}, { timestamps: true });

referralCodeSchema.index({ product: 1 });
referralCodeSchema.index({ owner: 1 });
referralCodeSchema.index({ isActive: 1 });

module.exports = mongoose.model('ReferralCode', referralCodeSchema);
