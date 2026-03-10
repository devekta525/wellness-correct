const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: String,
  thumbnail: String,
  price: Number,
  quantity: { type: Number, default: 1 },
  slug: String,
  variant: mongoose.Schema.Types.Mixed,
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
  totalValue: { type: Number, default: 0 },
  itemCount: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
  isAbandoned: { type: Boolean, default: false },
  abandonedAt: Date,
  recoveryEmailSent: { type: Boolean, default: false },
}, { timestamps: true });

// user index already created by unique: true on user field
cartSchema.index({ lastActivity: -1 });
cartSchema.index({ isAbandoned: 1, totalValue: -1 });

module.exports = mongoose.model('Cart', cartSchema);
