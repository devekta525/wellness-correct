const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const { createUniqueBrandSlug } = require('../utils/slugify');
const { cache } = require('../config/redis');

const isValidObjectId = (id) => id && mongoose.Types.ObjectId.isValid(id) && String(id).length === 24;

// @desc    Get all brands (public, active only)
// @route   GET /api/brands
const getBrands = asyncHandler(async (req, res) => {
  const cached = await cache.get('brands');
  if (cached) return res.json({ success: true, brands: cached, cached: true });

  const brands = await Brand.find({ isActive: true }).sort({ order: 1, name: 1 });
  await cache.set('brands', brands, 3600);
  res.json({ success: true, brands });
});

// @desc    Get brand by slug with product count
// @route   GET /api/brands/:slug
const getBrandBySlug = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug, isActive: true });
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }
  const productCount = await Product.countDocuments({
    brand: new RegExp(`^${brand.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    isActive: true,
  });
  res.json({ success: true, brand: { ...brand.toObject(), productCount } });
});

// @desc    Create brand (admin)
// @route   POST /api/admin/brands
const createBrand = asyncHandler(async (req, res) => {
  const { name, description, image, order, seo } = req.body;
  const slug = await createUniqueBrandSlug(name);
  const brand = await Brand.create({ name, slug, description, image, order, seo });
  await cache.del('brands');
  res.status(201).json({ success: true, brand });
});

// @desc    Update brand (admin)
// @route   PUT /api/admin/brands/:id
const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(404);
    throw new Error('Brand not found');
  }
  let brand = await Brand.findById(id);
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }
  if (req.body.name && req.body.name !== brand.name) {
    req.body.slug = await createUniqueBrandSlug(req.body.name, brand._id);
  }
  brand = await Brand.findByIdAndUpdate(id, req.body, { new: true });
  await cache.del('brands');
  res.json({ success: true, brand });
});

// @desc    Delete brand (admin)
// @route   DELETE /api/admin/brands/:id
const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(404);
    throw new Error('Brand not found');
  }
  const brand = await Brand.findById(id);
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }
  await brand.deleteOne();
  await cache.del('brands');
  res.json({ success: true, message: 'Brand deleted' });
});

// @desc    Get all brands (admin, including inactive)
// @route   GET /api/admin/brands
const getAdminBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find().sort({ order: 1, name: 1 });
  res.json({ success: true, brands });
});

module.exports = {
  getBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
  getAdminBrands,
};
