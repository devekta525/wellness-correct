const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc    Validate coupon
// @route   POST /api/coupons/validate
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) { res.status(404); throw new Error('Invalid coupon code'); }
  if (coupon.expiresAt < new Date()) { res.status(400); throw new Error('Coupon has expired'); }
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) { res.status(400); throw new Error('Coupon usage limit reached'); }
  if (orderAmount < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount ₹${coupon.minOrderAmount} required`);
  }

  // Check user usage
  if (req.user) {
    const userUsage = coupon.usedBy.filter(u => u.user?.toString() === req.user._id.toString()).length;
    if (userUsage >= coupon.userLimit) {
      res.status(400);
      throw new Error('You have already used this coupon the maximum number of times');
    }
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (orderAmount * coupon.value) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else if (coupon.type === 'fixed') {
    discount = Math.min(coupon.value, orderAmount);
  } else if (coupon.type === 'free_shipping') {
    discount = 49; // Standard shipping cost
  }

  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: Math.round(discount * 100) / 100,
      description: coupon.description,
    }
  });
});

// @desc    Get all coupons (admin)
// @route   GET /api/admin/coupons
const getCoupons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const total = await Coupon.countDocuments();
  const coupons = await Coupon.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  res.json({ success: true, coupons, pagination: { page: Number(page), limit: Number(limit), total } });
});

// @desc    Create coupon (admin)
// @route   POST /api/admin/coupons
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, code: req.body.code.toUpperCase() });
  res.status(201).json({ success: true, coupon });
});

// @desc    Update coupon (admin)
// @route   PUT /api/admin/coupons/:id
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  res.json({ success: true, coupon });
});

// @desc    Delete coupon (admin)
// @route   DELETE /api/admin/coupons/:id
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  await coupon.deleteOne();
  res.json({ success: true, message: 'Coupon deleted' });
});

module.exports = { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon };
