require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wellness_fuel';

mongoose.set('strictQuery', false);

const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');

// ── 5 dummy customers ────────────────────────────────────────────────────────
const DUMMY_USERS = [
  { name: 'Rohan Mehta',     email: 'rohan.mehta@example.com',     phone: '9876543210' },
  { name: 'Priya Sharma',    email: 'priya.sharma@example.com',    phone: '9876543211' },
  { name: 'Amit Joshi',      email: 'amit.joshi@example.com',      phone: '9876543212' },
  { name: 'Kavya Nair',      email: 'kavya.nair@example.com',      phone: '9876543213' },
  { name: 'Siddharth Rao',   email: 'siddharth.rao@example.com',   phone: '9876543214' },
];

// ── Review content pool ───────────────────────────────────────────────────────
const REVIEW_POOL = [
  { rating: 5, title: 'Life-changing product!',         comment: 'I have been using this for 3 months and my energy levels have gone through the roof. Absolutely worth every rupee.' },
  { rating: 5, title: 'Best supplement I have tried',   comment: 'Tried many brands before, but Wellness Fuel stands out. The quality is top-notch and results are visible within 2 weeks.' },
  { rating: 5, title: 'Highly recommended!',            comment: 'My trainer recommended this and I am so glad I listened. Recovery after workouts is noticeably faster now.' },
  { rating: 5, title: 'Excellent quality',              comment: 'Third-party tested and clearly pure. No fillers, no aftertaste. Will definitely reorder.' },
  { rating: 5, title: 'Amazing results',                comment: 'Noticed a huge difference in my skin and joint flexibility after just 4 weeks of consistent use.' },
  { rating: 4, title: 'Very good, minor gripe',         comment: 'Product is excellent and effective. Only wish the packaging had a better resealable lid, but quality itself is 5-star.' },
  { rating: 4, title: 'Great value for money',          comment: 'Good quality at a fair price. Noticed improvements in about 3 weeks. Will keep buying.' },
  { rating: 4, title: 'Good product, fast delivery',    comment: 'Packaging was secure and delivery was quicker than expected. The product itself works well.' },
  { rating: 4, title: 'Solid supplement',               comment: 'Been using it for a month. Energy is better and I feel more focused during the day.' },
  { rating: 4, title: 'Works as advertised',            comment: 'Skeptical at first, but this genuinely delivers on its promises. Good taste and easy to consume daily.' },
  { rating: 3, title: 'Decent, not a wow',              comment: 'Product is okay. Effects are mild for me personally. Might need more time to see full results.' },
  { rating: 3, title: 'Average experience',             comment: 'Neither disappointed nor amazed. It does the job but nothing extraordinary. Price feels slightly high.' },
  { rating: 3, title: 'Give it more time',              comment: 'Two weeks in and I notice subtle changes. Maybe I need to be more consistent. Product quality looks good though.' },
  { rating: 2, title: 'Expected more',                  comment: 'Did not see the results I was hoping for after a month. May work better for others.' },
  { rating: 1, title: 'Not for me',                    comment: 'Had a mild reaction so had to stop. Customer support was helpful, but the product did not suit me.' },
];

// ── Wellness Fuel fallback products (created only if DB has < 10 products) ───
const FALLBACK_PRODUCTS = [
  { title: 'Shilajit Resin Premium',      slug: 'shilajit-resin-premium',      price: 1299, comparePrice: 1499, discount: 13, description: 'Pure Himalayan Shilajit Resin for energy, stamina and vitality.' },
  { title: 'Marine Collagen Peptides',    slug: 'marine-collagen-peptides',    price: 1599, comparePrice: 1899, discount: 16, description: 'High-quality marine collagen for radiant skin and joint support.' },
  { title: 'Super Food Daily Blend',      slug: 'super-food-daily-blend',      price: 999,  comparePrice: 1199, discount: 17, description: 'Nutrient-dense superfood blend for daily wellness.' },
  { title: 'Glutathione Complex 500mg',   slug: 'glutathione-complex-500mg',   price: 1499, comparePrice: 1799, discount: 17, description: 'Master antioxidant complex for detox and bright skin.' },
  { title: 'Omega-3 Ultra 1000mg',        slug: 'omega-3-ultra-1000mg',        price: 899,  comparePrice: 1099, discount: 18, description: 'Ultra-pure omega-3 for heart health, brain function and joints.' },
  { title: 'Ashwagandha KSM-66',          slug: 'ashwagandha-ksm-66',          price: 799,  comparePrice: 999,  discount: 20, description: 'Clinically studied KSM-66 ashwagandha for stress relief and strength.' },
  { title: 'Vitamin D3 + K2 Drops',       slug: 'vitamin-d3-k2-drops',         price: 649,  comparePrice: 799,  discount: 19, description: 'Bioavailable D3 paired with K2 for immunity and bone density.' },
  { title: 'Shilajit Coffee Blend',       slug: 'shilajit-coffee-blend',       price: 1099, comparePrice: 1299, discount: 15, description: 'Premium Arabica coffee infused with pure Shilajit extract.' },
  { title: 'Magnesium Glycinate 400mg',   slug: 'magnesium-glycinate-400mg',   price: 749,  comparePrice: 899,  discount: 17, description: 'High-absorption magnesium glycinate for sleep, muscle and nerve health.' },
  { title: 'Plant Protein Isolate',       slug: 'plant-protein-isolate',       price: 1899, comparePrice: 2199, discount: 14, description: 'Complete plant-based protein isolate with all 9 essential amino acids.' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function upsertUser(userData) {
  const existing = await User.findOne({ email: userData.email });
  if (existing) return existing;

  const hashed = await bcrypt.hash('Dummy@123', 12);
  const user = await User.create({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    password: hashed,
    role: 'customer',
    isEmailVerified: true,
    addresses: [],
  });
  return user;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // 1. Ensure at least 10 products exist
  let products = await Product.find({ isActive: true }).limit(10).lean();
  const needed = 10 - products.length;

  if (needed > 0) {
    console.log(`📦 Only ${products.length} active products found. Creating ${needed} fallback products...`);
    const toCreate = FALLBACK_PRODUCTS.slice(0, needed);

    // Use a real category _id if any exists, else a random ObjectId
    const Category = require('../models/Category');
    const anyCategory = await Category.findOne().lean();
    const categoryId = anyCategory ? anyCategory._id : new mongoose.Types.ObjectId();

    const created = await Product.insertMany(
      toCreate.map((p) => ({ ...p, category: categoryId, isActive: true })),
      { ordered: false }
    );
    products = [...products, ...created];
  }

  products = products.slice(0, 10); // ensure exactly 10
  console.log(`📦 Using ${products.length} products`);

  // 2. Create / reuse 5 dummy users
  console.log('👤 Ensuring 5 dummy users exist...');
  const users = [];
  for (const u of DUMMY_USERS) {
    const user = await upsertUser(u);
    users.push(user);
  }
  console.log(`👥 Users ready: ${users.map((u) => u.name).join(', ')}`);

  // 3. Build 50 unique (user × product) pairs — 5 users × 10 products = 50 combos
  // Skip any pair that already has a review
  const pairs = [];
  for (const user of users) {
    for (const product of products) {
      pairs.push({ user: user._id, product: product._id });
    }
  }

  const existing = await Review.find({
    $or: pairs.map((p) => ({ user: p.user, product: p.product })),
  }).lean();

  const existingSet = new Set(existing.map((r) => `${r.user}_${r.product}`));
  const newPairs = pairs.filter((p) => !existingSet.has(`${p.user}_${p.product}`));

  if (newPairs.length === 0) {
    console.log('⚠️  All 50 (user, product) pairs already have reviews. Nothing to insert.');
    await mongoose.disconnect();
    return;
  }

  console.log(`⭐ Inserting ${newPairs.length} new reviews (${existing.length} already existed)...`);

  const reviewDocs = newPairs.map((pair) => {
    const { rating, title, comment } = pickRandom(REVIEW_POOL);
    return {
      user: pair.user,
      product: pair.product,
      rating,
      title,
      comment,
      isVerifiedPurchase: Math.random() < 0.6,
      status: 'approved',
    };
  });

  await Review.insertMany(reviewDocs, { ordered: false });
  console.log(`✅ Inserted ${reviewDocs.length} reviews.`);

  // 4. Update product ratings.average and ratings.count
  console.log('🔄 Updating product rating aggregates...');
  for (const product of products) {
    const agg = await Review.aggregate([
      { $match: { product: product._id, status: 'approved' } },
      { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (agg.length > 0) {
      await Product.findByIdAndUpdate(product._id, {
        'ratings.average': Math.round(agg[0].avg * 10) / 10,
        'ratings.count': agg[0].count,
      });
    }
  }
  console.log('✅ Product ratings updated.');

  await mongoose.disconnect();
  console.log('🔌 Done. Seeding complete.');
}

main().catch((err) => {
  console.error('❌ Seed error:', err.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
