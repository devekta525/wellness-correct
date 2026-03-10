const express = require('express');
const router = express.Router();
const { getBrands, getBrandBySlug } = require('../controllers/brandController');

router.get('/', getBrands);
router.get('/:slug', getBrandBySlug);

module.exports = router;
