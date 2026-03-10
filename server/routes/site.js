const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { getPublicCustomization } = require('../controllers/customizationController');
const Settings = require('../models/Settings');

router.get('/', getPublicCustomization);

// Public contact info
router.get('/contact', asyncHandler(async (req, res) => {
  const info = await Settings.get('contact_info', {
    email: 'hello@wellnessfuel.in',
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    address: 'Mumbai, Maharashtra, India — 400001',
    mapUrl: '',
    businessHours: 'Mon–Sat, 10am–6pm IST',
    social: { instagram: '', facebook: '', twitter: '', youtube: '' },
    responseTimes: { email: 'Within 24 hours', phone: 'Immediate (business hours)', whatsapp: 'Within 2 hours' },
    faqs: [],
  });
  res.json({ success: true, contactInfo: info });
}));

// Public contact form submission (store in Settings as a log or just acknowledge)
router.post('/contact', asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) { res.status(400); throw new Error('Name, email and message are required'); }
  // Could email or store; for now we acknowledge
  res.json({ success: true, message: 'Your message has been received. We will get back to you shortly.' });
}));

module.exports = router;
