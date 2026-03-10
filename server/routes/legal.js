const express = require('express');
const router = express.Router();
const { getLegalPage } = require('../controllers/legalController');

router.get('/:page', getLegalPage);

module.exports = router;
