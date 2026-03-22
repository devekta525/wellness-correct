const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  register, login, adminLogin, logout, getMe,
  updateProfile, changePassword, forgotPassword,
  resetPassword, addAddress, toggleWishlist, deleteAccount,
  sendOtp, verifyOtp,
} = require('../controllers/authController');

router.post('/send-otp', authLimiter, sendOtp);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/admin/login', authLimiter, adminLogin);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/addresses', protect, addAddress);
router.post('/wishlist/:productId', protect, toggleWishlist);
router.delete('/account', protect, deleteAccount);

module.exports = router;
