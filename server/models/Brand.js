const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Brand name is required'], trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, trim: true },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
  },
}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);
