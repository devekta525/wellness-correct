const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const { sendTokenResponse } = require('../utils/generateToken');
const { sendPasswordReset, sendWelcome, sendOTP } = require('../services/emailService');

// ── In-memory OTP store: { email: { otp, expiresAt } } ──
const otpStore = new Map();
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000)); // 6-digit

// @desc    Register user
// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  const allowedRoles = ['customer', 'vendor'];
  const safeRole = role && allowedRoles.includes(role) ? role : 'customer';

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email, password, phone, role: safeRole });
  await sendWelcome(user).catch(() => {});
  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Account is deactivated. Contact support.');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc    Admin login
// @route   POST /api/auth/admin/login
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, role: { $in: ['admin', 'superadmin'] } }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid admin credentials');
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Logout
// @route   POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'title thumbnail price slug');
  res.json({ success: true, user });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, language, darkMode, notificationPrefs } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, language, darkMode, notificationPrefs },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.json({ success: true, message: 'If email exists, reset link has been sent' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendPasswordReset(user, resetUrl).catch(() => {});

  res.json({ success: true, message: 'Password reset email sent' });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Add/update address
// @route   POST /api/auth/addresses
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { label, fullName, phone, street, city, state, pincode, country, isDefault } = req.body;

  if (isDefault) {
    user.addresses.forEach(a => a.isDefault = false);
  }

  user.addresses.push({ label, fullName, phone, street, city, state, pincode, country, isDefault });
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @desc    Toggle wishlist
// @route   POST /api/auth/wishlist/:productId
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  const idx = user.wishlist.findIndex((id) => id.toString() === productId);

  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    user.wishlist.push(productId);
  }

  await user.save();
  const updated = await User.findById(req.user._id).populate('wishlist', 'title thumbnail price slug discount');
  res.json({ success: true, wishlist: updated.wishlist, inWishlist: idx === -1 });
});

// @desc    Delete user account
// @route   DELETE /api/auth/account
const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: 'Account deleted' });
});

// @desc    Send OTP to email (login + auto-register)
// @route   POST /api/auth/send-otp
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) { res.status(400); throw new Error('Email is required'); }

  const normalized = email.trim().toLowerCase();

  // Rate limit: prevent spamming (1 OTP per 60s per email)
  const existing = otpStore.get(normalized);
  if (existing && existing.expiresAt - Date.now() > (OTP_EXPIRY_MS - 60000)) {
    res.status(429);
    throw new Error('OTP already sent. Please wait 60 seconds before requesting again.');
  }

  const otp = generateOTP();
  otpStore.set(normalized, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS });

  // Clean up expired entries periodically
  for (const [key, val] of otpStore) {
    if (val.expiresAt < Date.now()) otpStore.delete(key);
  }

  await sendOTP(normalized, otp);
  console.log(`OTP sent to ${normalized}`);

  res.json({ success: true, message: 'OTP sent to your email' });
});

// @desc    Verify OTP and login (auto-create user if new)
// @route   POST /api/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp, name } = req.body;
  if (!email || !otp) { res.status(400); throw new Error('Email and OTP are required'); }

  const normalized = email.trim().toLowerCase();
  const stored = otpStore.get(normalized);

  if (!stored) { res.status(400); throw new Error('No OTP found. Please request a new one.'); }
  if (stored.expiresAt < Date.now()) {
    otpStore.delete(normalized);
    res.status(400);
    throw new Error('OTP has expired. Please request a new one.');
  }
  if (stored.otp !== otp.trim()) { res.status(400); throw new Error('Invalid OTP. Please try again.'); }

  // OTP verified — clear it
  otpStore.delete(normalized);

  // Find or create user
  let user = await User.findOne({ email: normalized });
  if (!user) {
    // Auto-register with a random password (user won't need it — OTP only)
    const randomPass = crypto.randomBytes(20).toString('hex');
    user = await User.create({
      name: name || normalized.split('@')[0],
      email: normalized,
      password: randomPass,
      role: 'customer',
      isEmailVerified: true,
    });
    await sendWelcome(user).catch(() => {});
  }

  if (!user.isActive) { res.status(401); throw new Error('Account is deactivated. Contact support.'); }

  user.lastLogin = new Date();
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

module.exports = { register, login, adminLogin, logout, getMe, updateProfile, changePassword, forgotPassword, resetPassword, addAddress, toggleWishlist, deleteAccount, sendOtp, verifyOtp };
