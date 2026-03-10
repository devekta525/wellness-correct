const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const { createUniqueCategorySlug } = require('../utils/slugify');
const { cache } = require('../config/redis');

const isValidObjectId = (id) => id && mongoose.Types.ObjectId.isValid(id) && String(id).length === 24;

// Normalize parent: empty string or invalid id => null (avoids BSON CastError)
const normalizeParent = (parent) => {
  if (parent == null || parent === '') return null;
  return isValidObjectId(parent) ? parent : null;
};

// @desc    Get all categories
// @route   GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const cached = await cache.get('categories');
  if (cached) return res.json({ success: true, categories: cached, cached: true });

  const categories = await Category.find({ isActive: true, parent: null })
    .sort({ order: 1, name: 1 });

  await cache.set('categories', categories, 3600);
  res.json({ success: true, categories });
});

// @desc    Get category with products count
// @route   GET /api/categories/:slug
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) { res.status(404); throw new Error('Category not found'); }

  const Product = require('../models/Product');
  const productCount = await Product.countDocuments({ category: category._id, isActive: true });

  res.json({ success: true, category: { ...category.toObject(), productCount } });
});

// @desc    Create category (admin)
// @route   POST /api/admin/categories
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, icon, parent, order, seo } = req.body;
  const slug = await createUniqueCategorySlug(name);
  const parentId = normalizeParent(parent);

  const category = await Category.create({ name, slug, description, image, icon, parent: parentId, order, seo });
  await cache.del('categories');

  res.status(201).json({ success: true, category });
});

// @desc    Update category (admin)
// @route   PUT /api/admin/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(404);
    throw new Error('Category not found');
  }
  let category = await Category.findById(id);
  if (!category) { res.status(404); throw new Error('Category not found'); }

  const updateFields = { ...req.body };
  if (updateFields.name && updateFields.name !== category.name) {
    updateFields.slug = await createUniqueCategorySlug(updateFields.name, category._id);
  }
  // Avoid BSON CastError: empty string is invalid for ObjectId at path "parent"
  updateFields.parent = normalizeParent(updateFields.parent);

  category = await Category.findByIdAndUpdate(id, updateFields, { new: true });
  await cache.del('categories');

  res.json({ success: true, category });
});

// @desc    Delete category (admin)
// @route   DELETE /api/admin/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(404);
    throw new Error('Category not found');
  }
  const category = await Category.findById(id);
  if (!category) { res.status(404); throw new Error('Category not found'); }
  await category.deleteOne();
  await cache.del('categories');
  res.json({ success: true, message: 'Category deleted' });
});

// @desc    Get all categories (admin, including inactive)
// @route   GET /api/admin/categories
const getAdminCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ order: 1, name: 1 }).populate('parent', 'name');
  res.json({ success: true, categories });
});

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory, getAdminCategories };
