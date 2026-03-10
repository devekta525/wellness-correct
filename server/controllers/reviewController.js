const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Create review
// @route   POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { product, rating, title, comment, images } = req.body;

  const productDoc = await Product.findById(product);
  if (!productDoc) { res.status(404); throw new Error('Product not found'); }

  const existingReview = await Review.findOne({ product, user: req.user._id });
  if (existingReview) { res.status(400); throw new Error('You have already reviewed this product'); }

  // Check if user purchased product
  const order = await Order.findOne({
    user: req.user._id,
    'items.product': product,
    orderStatus: 'delivered',
  });

  const review = await Review.create({
    product, user: req.user._id, order: order?._id,
    rating, title, comment, images,
    isVerifiedPurchase: !!order,
    status: 'pending',
  });

  await review.populate('user', 'name avatar');

  res.status(201).json({ success: true, review });
});

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
const getProductReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = 'newest' } = req.query;

  const sortOptions = { newest: { createdAt: -1 }, highest: { rating: -1 }, lowest: { rating: 1 }, helpful: { helpful: -1 } };
  const skip = (Number(page) - 1) * Number(limit);

  const total = await Review.countDocuments({ product: req.params.productId, status: 'approved' });
  const reviews = await Review.find({ product: req.params.productId, status: 'approved' })
    .populate('user', 'name avatar')
    .sort(sortOptions[sort] || { createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(req.params.productId), status: 'approved' } },
    { $group: {
      _id: null,
      average: { $avg: '$rating' },
      total: { $sum: 1 },
      five: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      four: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
      three: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
      two: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
      one: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
    }}
  ]);

  res.json({ success: true, reviews, stats: stats[0] || {}, pagination: { page: Number(page), limit: Number(limit), total } });
});

// @desc    Get recent approved reviews (public, for homepage testimonials)
// @route   GET /api/reviews/recent
const getRecentReviews = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 12, 24);
  const reviews = await Review.find({ status: 'approved' })
    .populate('user', 'name avatar')
    .populate('product', 'title thumbnail')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const stats = await Review.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, average: { $avg: '$rating' }, total: { $sum: 1 } } }
  ]);
  const summary = stats[0] ? { average: stats[0].average, total: stats[0].total } : { average: 0, total: 0 };

  res.json({ success: true, reviews, stats: summary });
});

// @desc    Get all reviews (admin)
// @route   GET /api/admin/reviews
const getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .populate('user', 'name email')
    .populate('product', 'title thumbnail')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({ success: true, reviews, pagination: { page: Number(page), limit: Number(limit), total } });
});

// @desc    Update review status (admin)
// @route   PUT /api/admin/reviews/:id
const updateReview = asyncHandler(async (req, res) => {
  const { status, adminReply } = req.body;
  const review = await Review.findByIdAndUpdate(req.params.id, { status, adminReply }, { new: true })
    .populate('user', 'name').populate('product', 'title');

  if (!review) { res.status(404); throw new Error('Review not found'); }

  // Update product rating if approved
  if (status === 'approved') {
    const stats = await Review.aggregate([
      { $match: { product: review.product._id, status: 'approved' } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (stats[0]) {
      await Product.findByIdAndUpdate(review.product._id, {
        'ratings.average': Math.round(stats[0].average * 10) / 10,
        'ratings.count': stats[0].count,
      });
    }
  }

  res.json({ success: true, review });
});

module.exports = { createReview, getProductReviews, getRecentReviews, getAllReviews, updateReview };
