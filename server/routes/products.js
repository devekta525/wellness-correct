const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const {
  getProducts, getProduct, getFeaturedProducts, getFlashDeals,
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/flash-deals', getFlashDeals);
router.get('/:slug', optionalAuth, getProduct);

module.exports = router;
