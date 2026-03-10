const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: String,
  options: [{ value: String, stock: Number, priceModifier: Number }],
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Product title is required'], trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: [true, 'Description is required'] },
  shortDescription: { type: String },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  comparePrice: { type: Number, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  images: [{ url: String, alt: String, publicId: String }],
  thumbnail: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, trim: true },
  sku: { type: String, unique: true, sparse: true },
  stock: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  variants: [variantSchema],
  tags: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isFlashDeal: { type: Boolean, default: false },
  flashDealExpiry: Date,
  ratings: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  // AI Generated Fields
  aiGenerated: { type: Boolean, default: false },
  aiConfidenceScore: { type: Number, min: 0, max: 100 },
  aiRawData: mongoose.Schema.Types.Mixed,
  // SEO Fields
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    altText: String,
    schema: mongoose.Schema.Types.Mixed,
  },
  // Physical attributes detected by AI
  attributes: {
    color: [String],
    material: String,
    brand: String,
    detectedCategory: String,
    features: [String],
  },
  weight: Number,
  dimensions: { length: Number, width: Number, height: Number },
  shippingClass: { type: String, default: 'standard' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalSales: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
