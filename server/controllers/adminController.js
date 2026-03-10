const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');

// @desc    Get dashboard stats (all metrics from live DB; week-over-week change for revenue, orders, users)
// @route   GET /api/admin/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last7DaysStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  last7DaysStart.setHours(0, 0, 0, 0);
  const last14DaysStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  last14DaysStart.setHours(0, 0, 0, 0);

  const [
    totalUsers, newUsersToday, totalProducts, lowStockCount,
    totalOrders, ordersToday, revenueData, revenueToday,
    ordersByStatus, recentOrders, topProducts, salesLast7Days, lowStockProducts,
    revenueThisWeek, revenueLastWeek, ordersThisWeek, ordersLastWeek, usersThisWeek, usersLastWeek,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: today } }),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ $expr: { $lte: ['$stock', '$lowStockThreshold'] }, isActive: true }),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    // Top products from real order data (paid orders only), not Product.totalSales (can be seeded)
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSales: { $sum: '$items.quantity' } } },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $match: { 'product.isActive': true } },
      { $project: { _id: '$_id', title: '$product.title', thumbnail: '$product.thumbnail', price: '$product.price', totalSales: '$totalSales' } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: last7DaysStart }, paymentStatus: 'paid' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Product.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] }, isActive: true })
      .select('title thumbnail stock lowStockThreshold').limit(10),
    // Week-over-week: this week (last 7 days) vs previous week (7 days before that)
    Order.aggregate([{ $match: { createdAt: { $gte: last7DaysStart }, paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.aggregate([{ $match: { createdAt: { $gte: last14DaysStart, $lt: last7DaysStart }, paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.countDocuments({ createdAt: { $gte: last7DaysStart } }),
    Order.countDocuments({ createdAt: { $gte: last14DaysStart, $lt: last7DaysStart } }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: last7DaysStart } }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: last14DaysStart, $lt: last7DaysStart } }),
  ]);

  const revThis = revenueThisWeek[0]?.total || 0;
  const revLast = revenueLastWeek[0]?.total || 0;
  const revenueChangePercent = revLast > 0 ? Math.round(((revThis - revLast) / revLast) * 100) : (revThis > 0 ? 100 : 0);
  const ordersChangePercent = ordersLastWeek > 0 ? Math.round(((ordersThisWeek - ordersLastWeek) / ordersLastWeek) * 100) : (ordersThisWeek > 0 ? 100 : 0);
  const usersChangePercent = usersLastWeek > 0 ? Math.round(((usersThisWeek - usersLastWeek) / usersLastWeek) * 100) : (usersThisWeek > 0 ? 100 : 0);

  res.json({
    success: true,
    stats: {
      users: { total: totalUsers, today: newUsersToday, changePercent: usersChangePercent },
      products: { total: totalProducts, lowStock: lowStockCount },
      orders: { total: totalOrders, today: ordersToday, changePercent: ordersChangePercent },
      revenue: {
        total: revenueData[0]?.total || 0,
        today: revenueToday[0]?.total || 0,
        changePercent: revenueChangePercent,
      },
      ordersByStatus: Object.fromEntries(ordersByStatus.map((s) => [s._id, s.count])),
    },
    recentOrders,
    topProducts,
    lowStockProducts,
    salesLast7Days,
  });
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search, isActive } = req.query;
  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

  res.json({ success: true, users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

// @desc    Update user status (admin)
// @route   PUT /api/admin/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { isActive, role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive, role }, { new: true });
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, user });
});

// @desc    Get platform settings
// @route   GET /api/admin/settings
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.find({ group: { $ne: 'secret' } });
  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));
  res.json({ success: true, settings: settingsMap });
});

// @desc    Update settings
// @route   PUT /api/admin/settings
const updateSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;
  for (const [key, value] of Object.entries(settings)) {
    await Settings.set(key, value);
  }
  res.json({ success: true, message: 'Settings updated' });
});

// @desc    Create notification
// @route   POST /api/admin/notifications
const createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create({ ...req.body, sentAt: new Date(), status: 'sent' });
  res.status(201).json({ success: true, notification });
});

// @desc    Get notifications (admin)
// @route   GET /api/admin/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, notifications });
});

// @desc    Get sales analytics
// @route   GET /api/admin/analytics/sales
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;
  const match = { paymentStatus: 'paid' };

  // Default to last 30 days if no range given
  const now = new Date();
  const defaultEnd = now.toISOString().split('T')[0];
  const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const from = startDate || defaultStart;
  const to = endDate || defaultEnd;

  match.createdAt = {};
  match.createdAt.$gte = new Date(from + 'T00:00:00.000Z');
  // End of day (inclusive): use start of next day with $lt so the full 'to' day is included
  const toEnd = new Date(to + 'T00:00:00.000Z');
  toEnd.setUTCDate(toEnd.getUTCDate() + 1);
  match.createdAt.$lt = toEnd;

  const dateFormat = groupBy === 'month' ? '%Y-%m' : groupBy === 'week' ? '%Y-W%V' : '%Y-%m-%d';

  const [salesData, categoryData, paymentMethodData] = await Promise.all([
    Order.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: dateFormat, date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 }, avgOrder: { $avg: '$total' } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $group: { _id: '$category.name', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, count: { $sum: '$items.quantity' } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]),
    Order.aggregate([
      { $match: match },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
    ]),
  ]);

  res.json({ success: true, salesData, categoryData, paymentMethodData });
});

module.exports = { getDashboardStats, getUsers, updateUser, getSettings, updateSettings, createNotification, getNotifications, getSalesAnalytics };
