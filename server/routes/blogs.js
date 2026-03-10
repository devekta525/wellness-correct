const express = require('express');
const router = express.Router();
const { getBlogs, getBlogBySlug, getBlogCategories } = require('../controllers/blogController');

router.get('/', getBlogs);
router.get('/categories', getBlogCategories);
router.get('/:slug', getBlogBySlug);

module.exports = router;
