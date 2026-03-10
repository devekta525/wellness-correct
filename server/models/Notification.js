const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['order', 'promo', 'system', 'alert', 'review'], default: 'system' },
  target: { type: String, enum: ['all', 'specific', 'role'], default: 'all' },
  targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  targetRole: String,
  channels: { email: Boolean, push: Boolean, sms: Boolean },
  isRead: { type: Boolean, default: false },
  sentAt: Date,
  scheduledAt: Date,
  status: { type: String, enum: ['draft', 'sent', 'scheduled', 'failed'], default: 'draft' },
  data: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
