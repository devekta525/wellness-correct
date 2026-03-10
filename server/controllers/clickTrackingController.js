const ClickEvent = require('../models/ClickEvent');

/* ── helpers ─────────────────────────────────────────────────────── */
const detectDevice = (ua = '') => {
  if (/mobile/i.test(ua))         return 'mobile';
  if (/tablet|ipad/i.test(ua))    return 'tablet';
  if (/windows|mac|linux/i.test(ua)) return 'desktop';
  return 'unknown';
};

/* ── POST /api/tracking/click  (optional auth) ───────────────────── */
const recordClick = async (req, res) => {
  try {
    const {
      sessionId, page, path,
      elementType, elementText, elementId,
      category, metadata,
    } = req.body;

    const ua = req.headers['user-agent'] || '';

    await ClickEvent.create({
      user:        req.user?._id || null,
      sessionId,
      page,
      path,
      elementType,
      elementText: elementText?.slice(0, 120),   // cap length
      elementId,
      category:    category || 'other',
      metadata,
      userAgent:   ua,
      device:      detectDevice(ua),
      ip:          req.ip,
    });

    res.json({ success: true });
  } catch (_) {
    res.json({ success: false }); // non-critical
  }
};

/* ── GET /api/admin/click-tracking ──────────────────────────────── */
const getClickAnalytics = async (req, res) => {
  try {
    const {
      days = 7,
      userId,
      path: filterPath,
      category: filterCategory,
      page = 1,
      limit = 50,
    } = req.query;

    const since = new Date(Date.now() - parseInt(days) * 86400000);
    const skip  = (parseInt(page) - 1) * parseInt(limit);

    const baseFilter = { createdAt: { $gte: since } };
    if (userId)         baseFilter.user = userId;
    if (filterPath)     baseFilter.path = { $regex: filterPath, $options: 'i' };
    if (filterCategory) baseFilter.category = filterCategory;

    const [
      totalClicks,
      clicksByPage,
      clicksByCategory,
      clicksByDevice,
      clicksOverTime,
      topElements,
      recentEvents,
      totalDocs,
      topUsers,
    ] = await Promise.all([
      ClickEvent.countDocuments(baseFilter),

      // Top pages
      ClickEvent.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // By category
      ClickEvent.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // By device
      ClickEvent.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$device', count: { $sum: 1 } } },
      ]),

      // Daily click trend
      ClickEvent.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id:   { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top clicked elements
      ClickEvent.aggregate([
        { $match: { ...baseFilter, elementText: { $exists: true, $ne: '' } } },
        { $group: { _id: { text: '$elementText', type: '$elementType' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Recent events (paginated)
      ClickEvent.find(baseFilter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),

      ClickEvent.countDocuments(baseFilter),

      // Top users by click count
      ClickEvent.aggregate([
        { $match: { ...baseFilter, user: { $exists: true, $ne: null } } },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
        { $unwind: '$userInfo' },
        { $project: { count: 1, 'userInfo.name': 1, 'userInfo.email': 1 } },
      ]),
    ]);

    res.json({
      success: true,
      stats: { totalClicks },
      clicksByPage,
      clicksByCategory,
      clicksByDevice,
      clicksOverTime,
      topElements,
      recentEvents,
      topUsers,
      pagination: {
        total: totalDocs,
        page:  parseInt(page),
        pages: Math.ceil(totalDocs / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/admin/click-tracking/user/:userId ─────────────────── */
const getUserClickHistory = async (req, res) => {
  try {
    const { userId }           = req.params;
    const { days = 30, page = 1, limit = 50 } = req.query;

    const since  = new Date(Date.now() - parseInt(days) * 86400000);
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const filter = { user: userId, createdAt: { $gte: since } };

    const [events, total, pageSummary] = await Promise.all([
      ClickEvent.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      ClickEvent.countDocuments(filter),
      ClickEvent.aggregate([
        { $match: filter },
        { $group: { _id: '$path', count: { $sum: 1 }, last: { $max: '$createdAt' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      success: true,
      events,
      pageSummary,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { recordClick, getClickAnalytics, getUserClickHistory };
