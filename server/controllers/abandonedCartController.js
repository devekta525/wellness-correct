const Cart = require('../models/Cart');

/* ── helpers ─────────────────────────────────────────────────────── */
const ABANDON_HOURS = 1; // cart inactive > 1 hr = abandoned

const abandonThresholdDate = () =>
  new Date(Date.now() - ABANDON_HOURS * 60 * 60 * 1000);

const markAbandonedCarts = async () => {
  const threshold = abandonThresholdDate();
  await Cart.updateMany(
    { lastActivity: { $lt: threshold }, isAbandoned: false, itemCount: { $gt: 0 } },
    { $set: { isAbandoned: true, abandonedAt: new Date() } }
  );
};

/* ── POST /api/tracking/cart  (authenticated users only) ─────────── */
const syncCart = async (req, res) => {
  try {
    const { items = [] } = req.body;

    if (!items.length) {
      await Cart.findOneAndDelete({ user: req.user._id });
      return res.json({ success: true });
    }

    const totalValue = items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const itemCount  = items.reduce((s, i) => s + i.quantity, 0);

    await Cart.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          items: items.map(i => ({
            productId: i.product?._id || i.productId,
            title:     i.product?.title || i.title,
            thumbnail: i.product?.thumbnail || i.thumbnail,
            price:     i.price,
            quantity:  i.quantity,
            slug:      i.product?.slug || i.slug,
            variant:   i.variant || null,
          })),
          totalValue,
          itemCount,
          lastActivity: new Date(),
          isAbandoned: false,
          abandonedAt: null,
        },
      },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (err) {
    // Non-critical — don't surface errors to the user
    res.json({ success: false });
  }
};

/* ── GET /api/admin/abandoned-carts ─────────────────────────────── */
const getAbandonedCarts = async (req, res) => {
  try {
    await markAbandonedCarts();

    const { page = 1, limit = 20, minValue = 0, sortBy = 'value' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {
      itemCount:    { $gt: 0 },
      lastActivity: { $lt: abandonThresholdDate() },
      totalValue:   { $gte: parseFloat(minValue) },
    };

    const sortMap = {
      value:   { totalValue: -1 },
      recent:  { lastActivity: -1 },
      oldest:  { lastActivity: 1 },
      items:   { itemCount: -1 },
    };

    const [carts, total, stats] = await Promise.all([
      Cart.find(filter)
        .populate('user', 'name email phone createdAt lastLogin')
        .sort(sortMap[sortBy] || sortMap.value)
        .skip(skip)
        .limit(parseInt(limit)),

      Cart.countDocuments(filter),

      Cart.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalAbandoned: { $sum: 1 },
            totalValue:     { $sum: '$totalValue' },
            avgValue:       { $avg: '$totalValue' },
            totalItems:     { $sum: '$itemCount' },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      carts,
      pagination: {
        total,
        page:  parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
      stats: stats[0] || { totalAbandoned: 0, totalValue: 0, avgValue: 0, totalItems: 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { syncCart, getAbandonedCarts };
