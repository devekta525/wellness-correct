/**
 * Seed 100+ dummy reviews across products.
 * Run: node server/utils/seed-reviews.js
 * Requires: products and at least some users in DB (creates dummy customers if needed).
 */
require('dotenv').config();
const connectDB = require('../config/db');
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

const NUM_REVIEWS = 105;

const REVIEW_TITLES = [
  'Great product!', 'Exactly as described', 'Fast delivery', 'Very satisfied', 'Worth every penny',
  'Good quality', 'Happy with purchase', 'Recommended', 'Nice product', 'Perfect for my needs',
  'Exceeded expectations', 'Solid buy', 'Would buy again', 'No complaints', 'Pleased with quality',
  'Good value', 'Works well', 'As expected', 'Impressed', 'Love it',
  'Decent product', 'Okay', 'Could be better', 'Not bad', 'Average',
];

const REVIEW_COMMENTS = [
  'Works as described. Delivery was quick. Would recommend to others.',
  'Good quality for the price. Happy with my purchase.',
  'Exactly what I needed. Packaging was secure.',
  'Very satisfied. The product met my expectations.',
  'Great buy! Using it daily and no issues so far.',
  'Fast shipping. Product looks and works well.',
  'Nice product. Good value for money.',
  'Happy with this. Would order again.',
  'Solid product. Does what it says.',
  'Pleased with the quality. Arrived on time.',
  'Impressed with the build quality. Recommended.',
  'Good experience overall. No complaints.',
  'Works well. Exactly as shown in the pictures.',
  'Decent quality. Delivery was fast.',
  'Satisfied with the purchase. Thank you!',
  'Product is good. Packaging could be better but item is fine.',
  'Worth the price. Using it regularly.',
  'No issues. Would buy from again.',
  'Good product. Met my expectations.',
  'Nice and sturdy. Happy customer.',
  'Arrived in time. Product is as described.',
  'Quality is good. Recommended for the price.',
  'Works perfectly. Very happy.',
  'Good purchase. Will recommend.',
  'Pleased. Fast delivery and good product.',
];

const DUMMY_NAMES = [
  'Priya Sharma', 'Rahul Verma', 'Anita Patel', 'Vikram Singh', 'Kavita Reddy',
  'Suresh Kumar', 'Meera Nair', 'Rajesh Iyer', 'Pooja Gupta', 'Amit Desai',
  'Neha Joshi', 'Sanjay Mehta', 'Divya Krishnan', 'Arun Pillai', 'Lakshmi Rao',
  'Karthik Menon', 'Shruti Bhat', 'Rohan Malhotra', 'Preeti Choudhury', 'Nitin Agarwal',
  'Deepa Venkatesh', 'Manoj Saxena', 'Swati Trivedi', 'Aditya Kapoor', 'Rekha Nanda',
  'Vivek Bansal', 'Anjali Sinha', 'Gaurav Dutta', 'Sneha Rastogi', 'Tarun Chopra',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function ensureCustomerUsers(minCount) {
  const existing = await User.find({ role: 'customer' }).select('_id').lean();
  if (existing.length >= minCount) return existing;

  const bcrypt = require('bcryptjs');
  const toCreate = minCount - existing.length;
  const created = [];
  for (let i = 0; i < toCreate; i++) {
    const name = DUMMY_NAMES[i % DUMMY_NAMES.length];
    const safe = name.toLowerCase().replace(/\s+/g, '');
    const email = `seed.${safe}.${Date.now()}.${i}@example.com`;
    const hashed = await bcrypt.hash('Password@123', 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: 'customer',
      isActive: true,
    });
    created.push(user);
  }
  const all = await User.find({ role: 'customer' }).select('_id').lean();
  console.log(`  Customers: ${all.length} total (created ${created.length} dummy for seed)`);
  return all;
}

async function run() {
  await connectDB();
  console.log('Connected to DB\n');

  const products = await Product.find({ isActive: true }).select('_id').lean();
  if (products.length === 0) {
    console.error('No products found. Run seed-demo first: npm run seed:demo');
    process.exit(1);
  }

  const users = await ensureCustomerUsers(25);
  if (users.length === 0) {
    console.error('No customer users. Could not create dummy users.');
    process.exit(1);
  }

  const productIds = products.map((p) => p._id);
  const userIds = users.map((u) => u._id);

  const existingPairs = new Set();
  const existing = await Review.find({}).select('product user').lean();
  existing.forEach((r) => existingPairs.add(`${r.product}-${r.user}`));

  const toInsert = [];
  let attempts = 0;
  const maxAttempts = NUM_REVIEWS * 20;

  while (toInsert.length < NUM_REVIEWS && attempts < maxAttempts) {
    attempts++;
    const productId = productIds[rand(0, productIds.length - 1)];
    const userId = userIds[rand(0, userIds.length - 1)];
    const key = `${productId}-${userId}`;
    if (existingPairs.has(key)) continue;
    existingPairs.add(key);

    toInsert.push({
      _id: new mongoose.Types.ObjectId(),
      product: productId,
      user: userId,
      rating: rand(1, 5),
      title: pick(REVIEW_TITLES),
      comment: pick(REVIEW_COMMENTS),
      status: 'approved',
      isVerifiedPurchase: Math.random() < 0.4,
      helpful: rand(0, 15),
    });
  }

  if (toInsert.length === 0) {
    console.log('No new reviews to add (all product+user pairs already have reviews).');
    process.exit(0);
  }

  await Review.insertMany(toInsert);
  console.log(`  Inserted ${toInsert.length} reviews.\n`);

  const productIdList = [...new Set(toInsert.map((r) => r.product))];
  for (const pid of productIdList) {
    const stats = await Review.aggregate([
      { $match: { product: pid, status: 'approved' } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats[0]) {
      await Product.findByIdAndUpdate(pid, {
        'ratings.average': Math.round(stats[0].average * 10) / 10,
        'ratings.count': stats[0].count,
      });
    }
  }

  const total = await Review.countDocuments();
  console.log('🎉 Review seed complete!');
  console.log(`   New reviews: ${toInsert.length}`);
  console.log(`   Total reviews in DB: ${total}`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
