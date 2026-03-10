const mongoose = require('mongoose');
const ReferralCode = require('../models/ReferralCode');
const ReferralTracking = require('../models/ReferralTracking');
const UAParser = require('ua-parser-js');
const crypto = require('crypto');

const FRAUD_THRESHOLDS = {
  clicksPerHourPerIP: 10,
  suspiciousCountries: [],
};

const detectDevice = (userAgent) => {
  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  const browser = parser.getBrowser();
  const os = parser.getOS();

  let deviceType = 'unknown';
  if (device.type === 'mobile') deviceType = 'mobile';
  else if (device.type === 'tablet') deviceType = 'tablet';
  else if (!device.type) deviceType = 'desktop';

  // Basic bot detection
  const botPatterns = /bot|crawler|spider|scraper|curl|wget|python|java|go-http/i;
  const isBot = botPatterns.test(userAgent);

  return { device: deviceType, browser: browser.name, os: os.name, isBot };
};

const hashIP = (ip) => {
  return crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex').substring(0, 16);
};

const detectFraud = async (ip, code, sessionId) => {
  const reasons = [];

  // Check clicks from same IP in last hour
  const recentClicks = await ReferralTracking.countDocuments({
    ip,
    code,
    type: 'click',
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
  });

  if (recentClicks >= FRAUD_THRESHOLDS.clicksPerHourPerIP) {
    reasons.push('excessive_clicks_same_ip');
  }

  return { isSuspicious: reasons.length > 0, reasons };
};

const trackClick = async ({ code, ip, userAgent, sessionId, userId, referrer, landingPage }) => {
  const referralCode = await ReferralCode.findOne({ code: code.toUpperCase() });

  if (!referralCode) return null;
  if (!referralCode.isActive) return null;
  if (referralCode.expiresAt && referralCode.expiresAt < new Date()) return null;
  if (referralCode.usageLimit && referralCode.usageCount >= referralCode.usageLimit) return null;

  const { device, browser, os, isBot } = detectDevice(userAgent || '');
  const ipHash = hashIP(ip || '');

  // Check for duplicate clicks (same session + code in last 30 min)
  const recentTrack = await ReferralTracking.findOne({
    code: code.toUpperCase(),
    sessionId,
    type: 'click',
    createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
  });

  const isDuplicate = !!recentTrack;

  const { isSuspicious, reasons } = await detectFraud(ip, code.toUpperCase(), sessionId);

  const tracking = await ReferralTracking.create({
    referralCode: referralCode._id,
    code: code.toUpperCase(),
    product: referralCode.product,
    type: 'click',
    sessionId,
    userId,
    ip,
    ipHash,
    userAgent,
    device,
    browser,
    os,
    referrer,
    landingPage,
    isBot,
    isDuplicate,
    isSuspicious,
    suspicionReasons: reasons,
  });

  // Update aggregated stats (only count non-bot, non-duplicate, non-suspicious clicks)
  if (!isBot && !isDuplicate && !isSuspicious) {
    await ReferralCode.findByIdAndUpdate(referralCode._id, {
      $inc: { 'stats.clicks': 1, usageCount: 1 },
      $set: { 'stats.lastClickAt': new Date() },
    });
  }

  return { tracking, referralCode };
};

const trackConversion = async ({ code, orderId, orderValue, userId }) => {
  const referralCode = await ReferralCode.findOne({ code: code.toUpperCase() });
  if (!referralCode) return null;

  let commissionAmount = 0;
  if (referralCode.commissionRate > 0) {
    commissionAmount = referralCode.commissionType === 'percentage'
      ? (orderValue * referralCode.commissionRate) / 100
      : referralCode.commissionRate;
  }

  const tracking = await ReferralTracking.create({
    referralCode: referralCode._id,
    code: code.toUpperCase(),
    product: referralCode.product,
    type: 'conversion',
    userId,
    order: orderId,
    orderValue,
    commissionAmount,
  });

  // Update aggregated stats
  const newRevenue = referralCode.stats.revenue + orderValue;
  const newConversions = referralCode.stats.conversions + 1;
  const conversionRate = referralCode.stats.clicks > 0
    ? (newConversions / referralCode.stats.clicks) * 100
    : 0;

  await ReferralCode.findByIdAndUpdate(referralCode._id, {
    $inc: { 'stats.conversions': 1, 'stats.revenue': orderValue },
    $set: {
      'stats.conversionRate': Math.round(conversionRate * 100) / 100,
      'stats.lastConversionAt': new Date(),
    },
  });

  return { tracking, commissionAmount };
};

const getAnalytics = async ({ startDate, endDate, productId, ownerId, limit = 20 } = {}) => {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  if (productId) match.product = new mongoose.Types.ObjectId(productId);

  const codeQuery = {};
  if (ownerId) codeQuery.owner = ownerId;

  const codes = await ReferralCode.find(codeQuery)
    .populate('product', 'title thumbnail')
    .populate('owner', 'name email')
    .sort({ 'stats.revenue': -1 })
    .limit(limit);

  const clicksOverTime = await ReferralTracking.aggregate([
    { $match: { ...match, type: 'click', isBot: false, isDuplicate: false } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const conversionsOverTime = await ReferralTracking.aggregate([
    { $match: { ...match, type: 'conversion' } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$orderValue' } } },
    { $sort: { _id: 1 } },
  ]);

  const totals = await ReferralTracking.aggregate([
    { $match: match },
    { $group: {
      _id: null,
      totalClicks: { $sum: { $cond: [{ $eq: ['$type', 'click'] }, 1, 0] } },
      totalConversions: { $sum: { $cond: [{ $eq: ['$type', 'conversion'] }, 1, 0] } },
      totalRevenue: { $sum: { $cond: [{ $eq: ['$type', 'conversion'] }, '$orderValue', 0] } },
    }}
  ]);

  return { codes, clicksOverTime, conversionsOverTime, totals: totals[0] || {} };
};

module.exports = { trackClick, trackConversion, getAnalytics, detectDevice };
