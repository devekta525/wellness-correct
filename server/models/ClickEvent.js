const mongoose = require('mongoose');

const clickEventSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId:   String,
  page:        String,          // full URL
  path:        String,          // pathname only
  elementType: String,          // button | link | product-card | nav | search | cart | other
  elementText: String,          // visible text of clicked element
  elementId:   String,          // data-track-id attribute
  category:    {
    type: String,
    enum: ['navigation', 'product', 'button', 'link', 'search', 'cart', 'other'],
    default: 'other',
  },
  metadata:    mongoose.Schema.Types.Mixed,
  userAgent:   String,
  device:      { type: String, enum: ['mobile', 'tablet', 'desktop', 'unknown'], default: 'unknown' },
  ip:          String,
}, { timestamps: true });

clickEventSchema.index({ user: 1, createdAt: -1 });
clickEventSchema.index({ path: 1 });
clickEventSchema.index({ createdAt: -1 });
clickEventSchema.index({ sessionId: 1 });
clickEventSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('ClickEvent', clickEventSchema);
