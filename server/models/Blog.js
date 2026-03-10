const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  slug: { type: String, unique: true, lowercase: true },
  content: { type: String, required: [true, 'Content is required'] },
  excerpt: { type: String },
  coverImage: { type: String },
  coverImagePublicId: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, default: 'General', trim: true },
  tags: [String],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  views: { type: Number, default: 0 },
  readTime: { type: Number, default: 1 },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
  },
  publishedAt: { type: Date },
}, { timestamps: true });

// Generate slug + excerpt + readTime before save
blogSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80);
  }
  if (this.isModified('content')) {
    const text = this.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!this.excerpt) this.excerpt = text.slice(0, 180);
    this.readTime = Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

blogSchema.index({ status: 1, publishedAt: -1 });
// slug index already created by unique: true on slug field
blogSchema.index({ category: 1 });

module.exports = mongoose.model('Blog', blogSchema);
