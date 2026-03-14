const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Review = require('../models/Review');
const { cache } = require('../config/redis');
const { createUniqueProductSlug } = require('../utils/slugify');

/** Get review count and average per product (approved only). Returns Map of productId string -> { average, count }. */
async function getReviewStatsForProducts(productIds) {
  if (!productIds?.length) return new Map();
  const ids = productIds.map((id) => (typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id));
  const stats = await Review.aggregate([
    { $match: { product: { $in: ids }, status: 'approved' } },
    { $group: { _id: '$product', average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const map = new Map();
  stats.forEach((s) => {
    map.set(s._id.toString(), {
      average: Math.round(s.average * 10) / 10,
      count: s.count,
    });
  });
  return map;
}

function attachRatingsToProducts(products, reviewStats) {
  return products.map((p) => {
    const po = p.toObject ? p.toObject() : { ...p };
    const id = (po._id || p._id).toString();
    const stats = reviewStats.get(id);
    po.ratings = stats ? { average: stats.average, count: stats.count } : { average: 0, count: 0 };
    return po;
  });
}

// @desc    Get all products
// @route   GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const { category, brand: brandSlug, search, minPrice, maxPrice, sort, page = 1, limit = 20, featured, flashDeal, minRating, inStock } = req.query;

  const query = { isActive: true };

  if (category) query.category = category;
  if (brandSlug) {
    const Brand = require('../models/Brand');
    const brandDoc = await Brand.findOne({ slug: brandSlug, isActive: true });
    if (brandDoc) query.brand = new RegExp(`^${brandDoc.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  }
  if (featured === 'true') query.isFeatured = true;
  if (flashDeal === 'true') { query.isFlashDeal = true; query.flashDealExpiry = { $gt: new Date() }; }
  if (inStock === 'true') query.stock = { $gt: 0 };
  if (inStock === 'false') query.$or = [{ stock: 0 }, { stock: { $exists: false } }];
  if (minRating) query['ratings.average'] = { $gte: Number(minRating) };

  if (search) {
    query.$text = { $search: search };
  }

  if (minPrice || maxPrice) {
    query.price = query.price || {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    popular: { 'ratings.average': -1, totalSales: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    bestseller: { totalSales: -1 },
  };
  const sortBy = sortOptions[sort] || { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort(sortBy)
    .skip(skip)
    .limit(Number(limit))
    .select('-aiRawData -seo.schema');

  const reviewStats = await getReviewStatsForProducts(products.map((p) => p._id));
  const productsWithRatings = attachRatingsToProducts(products, reviewStats);

  res.json({
    success: true,
    products: productsWithRatings,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Get single product
// @route   GET /api/products/:slug
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug')
    .populate('createdBy', 'name');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Increment view count
  await Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } });

  const reviewStats = await getReviewStatsForProducts([product._id]);
  const stats = reviewStats.get(product._id.toString());
  const productObj = product.toObject ? product.toObject() : { ...product };
  productObj.ratings = stats ? { average: stats.average, count: stats.count } : { average: 0, count: 0 };

  res.json({ success: true, product: productObj });
});

// @desc    Create product
// @route   POST /api/admin/products
const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, category, stock, ...rest } = req.body;

  const slug = await createUniqueProductSlug(title);
  const product = await Product.create({
    title, description, price, category, stock, slug,
    ...rest,
    createdBy: req.user._id,
  });

  await cache.del('featured_products');

  res.status(201).json({ success: true, product });
});

// @desc    Update product
// @route   PUT /api/admin/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  if (req.body.title && req.body.title !== product.title) {
    req.body.slug = await createUniqueProductSlug(req.body.title, product._id);
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('category', 'name slug');

  await cache.del('featured_products');

  res.json({ success: true, product });
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});

// @desc    Get featured products
// @route   GET /api/products/featured
const getFeaturedProducts = asyncHandler(async (req, res) => {
  let products = await cache.get('featured_products');
  const fromCache = !!products;
  if (!products) {
    products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .select('-aiRawData')
      .limit(12);
    await cache.set('featured_products', products, 1800);
  }

  const reviewStats = await getReviewStatsForProducts(products.map((p) => p._id));
  const productsWithRatings = attachRatingsToProducts(products, reviewStats);
  res.json({ success: true, products: productsWithRatings, cached: fromCache });
});

// @desc    Get flash deals
// @route   GET /api/products/flash-deals
const getFlashDeals = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isFlashDeal: true,
    isActive: true,
    flashDealExpiry: { $gt: new Date() },
  }).populate('category', 'name slug').limit(8);

  const reviewStats = await getReviewStatsForProducts(products.map((p) => p._id));
  const productsWithRatings = attachRatingsToProducts(products, reviewStats);
  res.json({ success: true, products: productsWithRatings });
});

// @desc    Update product images
// @route   POST /api/admin/products/:id/images
const updateProductImages = asyncHandler(async (req, res) => {
  const { images } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { images, thumbnail: images[0]?.url },
    { new: true }
  );
  res.json({ success: true, product });
});

// @desc    Get single product by ID (admin)
// @route   GET /api/admin/products/:id
const getAdminProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @desc    Get admin products (all, including inactive)
// @route   GET /api/admin/products
const getAdminProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, category, status } = req.query;
  const query = {};
  if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { sku: { $regex: search, $options: 'i' } }];
  if (category) query.category = category;
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;
  if (status === 'low_stock') query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
  if (status === 'out_of_stock') query.stock = 0;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({ success: true, products, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFeaturedProducts, getFlashDeals, updateProductImages, getAdminProducts, getAdminProduct };
