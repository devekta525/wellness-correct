const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { upload, uploadMemory } = require('../config/cloudinary');

// Admin middleware applied to all routes
router.use(protect, admin);

// Dashboard
const { getDashboardStats, getUsers, updateUser, getSettings, updateSettings, createNotification, getNotifications, getSalesAnalytics } = require('../controllers/adminController');
router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/notifications', createNotification);
router.get('/notifications', getNotifications);
router.get('/analytics/sales', getSalesAnalytics);

// Products
const { createProduct, updateProduct, deleteProduct, getAdminProducts, getAdminProduct, updateProductImages } = require('../controllers/productController');
router.get('/products', getAdminProducts);
router.post('/products', createProduct);
router.get('/products/:id', getAdminProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/:id/images', updateProductImages);

// Image upload
router.post('/upload', upload.array('images', 10), (req, res) => {
  const images = req.files.map(f => ({
    url: f.path,
    publicId: f.filename,
    alt: f.originalname,
  }));
  res.json({ success: true, images });
});

// Categories
const { createCategory, updateCategory, deleteCategory, getAdminCategories } = require('../controllers/categoryController');
router.get('/categories', getAdminCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Brands
const { createBrand, updateBrand, deleteBrand, getAdminBrands } = require('../controllers/brandController');
router.get('/brands', getAdminBrands);
router.post('/brands', createBrand);
router.put('/brands/:id', updateBrand);
router.delete('/brands/:id', deleteBrand);

// Orders
const { updateOrderStatus, updatePaymentStatus, getAllOrders } = require('../controllers/orderController');
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/payment', updatePaymentStatus);

// Reviews
const { getAllReviews, updateReview } = require('../controllers/reviewController');
router.get('/reviews', getAllReviews);
router.put('/reviews/:id', updateReview);

// Coupons
const { getCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Referral
const { createReferralCode, getReferralCodes, getReferralCode, updateReferralCode, deleteReferralCode, getReferralAnalytics, exportAnalytics } = require('../controllers/referralController');
router.get('/referral/codes', getReferralCodes);
router.post('/referral/codes', createReferralCode);
router.get('/referral/codes/:id', getReferralCode);
router.put('/referral/codes/:id', updateReferralCode);
router.delete('/referral/codes/:id', deleteReferralCode);
router.get('/referral/analytics', getReferralAnalytics);
router.get('/referral/analytics/export', exportAnalytics);

// AI
const { analyzeProductImage, regenerateContent, generateSEO, saveAISettings, getAISettings, testAIConnection, generateMockup } = require('../controllers/aiController');
router.post('/ai/analyze-image', uploadMemory.single('image'), analyzeProductImage);
router.post('/ai/regenerate', regenerateContent);
router.post('/ai/generate-seo', generateSEO);
router.get('/ai/settings', getAISettings);
router.post('/ai/settings', saveAISettings);
router.get('/ai/test', testAIConnection);
router.post('/ai/studio/mockup', uploadMemory.single('image'), generateMockup);

// Reports (Excel)
const { generateReport, getReportTypes } = require('../controllers/reportController');
router.get('/reports/types', getReportTypes);
router.get('/reports/excel', generateReport);

// Site customization (banners, logo, favicon, social, contact)
const { getCustomization, updateCustomization, uploadSiteAsset } = require('../controllers/customizationController');
router.get('/customization', getCustomization);
router.put('/customization', updateCustomization);
router.post('/customization/upload', uploadMemory.single('file'), uploadSiteAsset);

// Gateway Management (Payment + Shipping)
const asyncHandler = require('express-async-handler');
const paymentManager = require('../services/payment/paymentManager');
const shippingManager = require('../services/shipping/shippingManager');

// Payment gateways
router.get('/gateways/payment', asyncHandler(async (req, res) => {
  const gateways = await paymentManager.getAllGateways();
  res.json({ success: true, gateways });
}));

router.put('/gateways/payment/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!paymentManager.GATEWAYS[id]) { res.status(404); throw new Error('Unknown gateway'); }
  const { enabled, mode, config } = req.body;
  await paymentManager.saveGatewayConfig(id, { enabled: Boolean(enabled), mode: mode || 'test', config: config || {} });
  res.json({ success: true, message: 'Gateway config saved' });
}));

router.post('/gateways/payment/:id/test', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { config, mode } = req.body || {};
  const result = await paymentManager.testConnection(id, { config, mode });
  res.json({ success: true, ...result });
}));

// Shipping providers
router.get('/gateways/shipping', asyncHandler(async (req, res) => {
  const providers = await shippingManager.getAllProviders();
  res.json({ success: true, providers });
}));

router.put('/gateways/shipping/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!shippingManager.PROVIDERS[id]) { res.status(404); throw new Error('Unknown provider'); }
  const { enabled, mode, config } = req.body;
  await shippingManager.saveProviderConfig(id, { enabled: Boolean(enabled), mode: mode || 'test', config: config || {} });
  res.json({ success: true, message: 'Shipping provider config saved' });
}));

router.post('/gateways/shipping/:id/test', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { config, mode } = req.body || {};
  const result = await shippingManager.testConnection(id, { config, mode });
  res.json({ success: true, ...result });
}));

// Blogs
const { adminGetBlogs, adminGetBlog, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
router.get('/blogs', adminGetBlogs);
router.get('/blogs/:id', adminGetBlog);
router.post('/blogs', createBlog);
router.put('/blogs/:id', updateBlog);
router.delete('/blogs/:id', deleteBlog);

// Contact Info
const asyncHandlerContact = require('express-async-handler');
const Settings = require('../models/Settings');
router.get('/contact-info', asyncHandlerContact(async (req, res) => {
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
router.put('/contact-info', asyncHandlerContact(async (req, res) => {
  await Settings.set('contact_info', req.body, 'contact');
  res.json({ success: true, message: 'Contact info updated' });
}));

// Doctors & Consultations (Admin)
const { adminGetDoctors, adminGetDoctor, adminUpdateDoctor, adminDeleteDoctor, adminGetAllConsultations } = require('../controllers/doctorController');
router.get('/doctors', adminGetDoctors);
router.get('/doctors/:id', adminGetDoctor);
router.put('/doctors/:id', adminUpdateDoctor);
router.delete('/doctors/:id', adminDeleteDoctor);
router.get('/consultations', adminGetAllConsultations);

// Abandoned Carts
const { getAbandonedCarts } = require('../controllers/abandonedCartController');
router.get('/abandoned-carts', getAbandonedCarts);

// Click Tracking
const { getClickAnalytics, getUserClickHistory } = require('../controllers/clickTrackingController');
router.get('/click-tracking', getClickAnalytics);
router.get('/click-tracking/user/:userId', getUserClickHistory);

// Legal Pages
const { getLegalPage, updateLegalPage } = require('../controllers/legalController');
router.get('/legal/:page', getLegalPage);
router.put('/legal/:page', updateLegalPage);

module.exports = router;
