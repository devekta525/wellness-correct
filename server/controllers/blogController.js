const asyncHandler = require('express-async-handler');
const Blog = require('../models/Blog');

// ── Public ──────────────────────────────────────────────────────────

// GET /api/blogs
exports.getBlogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const category = req.query.category;
  const tag = req.query.tag;
  const search = req.query.search;

  const filter = { status: 'published' };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (search) filter.$text = { $search: search };

  const total = await Blog.countDocuments(filter);
  const blogs = await Blog.find(filter)
    .populate('author', 'name avatar')
    .sort({ publishedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-content');

  res.json({
    success: true,
    blogs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// GET /api/blogs/:slug
exports.getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
    .populate('author', 'name avatar');
  if (!blog) { res.status(404); throw new Error('Blog post not found'); }

  blog.views += 1;
  await blog.save({ validateBeforeSave: false });

  res.json({ success: true, blog });
});

// GET /api/blogs/categories (distinct published categories)
exports.getBlogCategories = asyncHandler(async (req, res) => {
  const categories = await Blog.distinct('category', { status: 'published' });
  res.json({ success: true, categories });
});

// ── Admin ───────────────────────────────────────────────────────────

// GET /api/admin/blogs
exports.adminGetBlogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const status = req.query.status;

  const filter = {};
  if (status) filter.status = status;

  const total = await Blog.countDocuments(filter);
  const blogs = await Blog.find(filter)
    .populate('author', 'name')
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-content');

  res.json({
    success: true,
    blogs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// GET /api/admin/blogs/:id
exports.adminGetBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('author', 'name');
  if (!blog) { res.status(404); throw new Error('Blog not found'); }
  res.json({ success: true, blog });
});

// POST /api/admin/blogs
exports.createBlog = asyncHandler(async (req, res) => {
  const { title, content, excerpt, coverImage, coverImagePublicId, category, tags, status, seo } = req.body;

  // Ensure unique slug
  let slug = title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
  const existing = await Blog.findOne({ slug });
  if (existing) slug = `${slug}-${Date.now()}`;

  const blog = await Blog.create({
    title,
    slug,
    content,
    excerpt,
    coverImage,
    coverImagePublicId,
    category: category || 'General',
    tags: tags || [],
    status: status || 'draft',
    seo: seo || {},
    author: req.user._id,
  });

  res.status(201).json({ success: true, blog });
});

// PUT /api/admin/blogs/:id
exports.updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) { res.status(404); throw new Error('Blog not found'); }

  const fields = ['title', 'content', 'excerpt', 'coverImage', 'coverImagePublicId', 'category', 'tags', 'status', 'seo'];
  fields.forEach(f => { if (req.body[f] !== undefined) blog[f] = req.body[f]; });

  // Allow manual slug override
  if (req.body.slug) blog.slug = req.body.slug;

  await blog.save();
  res.json({ success: true, blog });
});

// DELETE /api/admin/blogs/:id
exports.deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) { res.status(404); throw new Error('Blog not found'); }
  res.json({ success: true, message: 'Blog deleted' });
});
