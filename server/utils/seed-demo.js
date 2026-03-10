/**
 * Seed 100+ dummy products, categories, and brands with Unsplash images.
 * Run: node server/utils/seed-demo.js
 * Optional: SEED_DEMO_FORCE=1 to replace existing demo data.
 */
require('dotenv').config();
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const User = require('../models/User');
const { createUniqueCategorySlug, createUniqueBrandSlug, createUniqueProductSlug } = require('./slugify');

const U = (id, w = 600) => `https://images.unsplash.com/photo-${id}?w=${w}`;

// Unsplash image IDs for categories (various themes)
const CATEGORY_IMAGES = [
  '1523275335684-37898b6baf30', // watch
  '1505740420928-5e560c06d30e', // headphones
  '1558618666-fcd25c85cd64',   // fashion
  '1586023492125-6bcf15f0fce0', // home
  '1512820790803-83ca734da794', // books
  '1571019613454-1cb2f99b2d8b', // fitness
  '1596462502274-9bbdcf8069da', // beauty
  '1587654780291-39c9404d746b', // toys
  '1542838132-92c53300491e',   // grocery
  '1560343090-7433210fad79',   // bags
  '1607083206869-4c76782e4d85', // shoes
  '1523275335684-37898b6baf30', // accessories
];

const CATEGORIES = [
  { name: 'Electronics', description: 'Gadgets, phones, and electronic devices', order: 1 },
  { name: 'Fashion', description: 'Clothing, apparel and style', order: 2 },
  { name: 'Home & Kitchen', description: 'Home decor and kitchen appliances', order: 3 },
  { name: 'Books & Stationery', description: 'Books, magazines, and office supplies', order: 4 },
  { name: 'Sports & Fitness', description: 'Sports equipment and fitness gear', order: 5 },
  { name: 'Beauty & Health', description: 'Beauty products and health care', order: 6 },
  { name: 'Toys & Games', description: 'Toys and gaming products', order: 7 },
  { name: 'Grocery', description: 'Daily groceries and food items', order: 8 },
  { name: 'Bags & Luggage', description: 'Bags, backpacks and travel', order: 9 },
  { name: 'Footwear', description: 'Shoes and sandals', order: 10 },
  { name: 'Accessories', description: 'Watches, jewellery and more', order: 11 },
];

const BRANDS = [
  { name: 'Nike', description: 'Just Do It.' },
  { name: 'Samsung', description: 'Innovation for all.' },
  { name: 'Apple', description: 'Think different.' },
  { name: 'Sony', description: 'Make.believe' },
  { name: 'Adidas', description: 'Impossible is nothing.' },
  { name: 'Philips', description: 'Innovation and you.' },
  { name: 'Puma', description: 'Forever faster.' },
  { name: 'LG', description: 'Life\'s good.' },
  { name: 'Bose', description: 'Better sound through research.' },
  { name: 'Dell', description: 'The power to do more.' },
  { name: 'HP', description: 'Keep reinventing.' },
  { name: 'Canon', description: 'Delighting you always.' },
  { name: 'Nivea', description: 'Care for life.' },
  { name: 'Colgate', description: 'Healthy smile for life.' },
  { name: 'Reebok', description: 'Be more human.' },
  { name: 'Under Armour', description: 'Performance innovation.' },
  { name: 'Skechers', description: 'Comfortable footwear.' },
  { name: 'Levi\'s', description: 'Quality never goes out of style.' },
  { name: 'Ray-Ban', description: 'Authentic style.' },
];

// Many Unsplash product/lifestyle image IDs for products
const PRODUCT_IMAGES = [
  '1523275335684-37898b6baf30', '1505740420928-5e560c06d30e', '1523275335684-37898b6baf30',
  '1542291026-7eec264c27ff', '1560343090-7433210fad79', '1607083206869-4c76782e4d85',
  '1572635198757-5e7f4b2c2b0b', '1585386959984-a4155224a1ad', '1584917860122-85945e3f2f52',
  '1593642632555-0e6b3fc5b1b2', '1593642702849-aa68f53a4082', '1602143407151-711cb2a8668d',
  '1606107557195-0e29a4c5b53e', '1611186874658-efb4e8cd88d3', '1612817288484-963f9e92cce2',
  '1617127365652-63dfd8dd7599', '1620917323198-9e8e2497c3d2', '1622470952774-6942c6f5a3a3',
  '1623399925822-9a1c6d0e5c5a', '1625772452419-99123493ebb2', '1626195069407-0e7d1d8c4b3a',
  '1523275335684-37898b6baf30', '1546868871-7041f2a27e8f', '1560343090-7433210fad79',
  '1585386959984-a4155224a1ad', '1593642632555-0e6b3fc5b1b2', '1602143407151-711cb2a8668d',
  '1611186874658-efb4e8cd88d3', '1620917323198-9e8e2497c3d2', '1560343090-7433210fad79',
  '1572635198757-5e7f4b2c2b0b', '1584917860122-85945e3f2f52', '1606107557195-0e29a4c5b53e',
  '1625772452419-99123493ebb2', '1542291026-7eec264c27ff', '1607083206869-4c76782e4d85',
  '1558618666-fcd25c85cd64', '1512820790803-83ca734da794', '1571019613454-1cb2f99b2d8b',
  '1596462502274-9bbdcf8069da', '1587654780291-39c9404d746b', '1542838132-92c53300491e',
  '1560343090-7433210fad79', '1607083206869-4c76782e4d85', '1523275335684-37898b6baf30',
  '1505740420928-5e560c06d30e', '1586023492125-6bcf15f0fce0', '1558618666-fcd25c85cd64',
];

const PRODUCT_TITLES = [
  'Wireless Bluetooth Headphones', 'Classic Running Shoes', 'Smart Watch Pro', 'Leather Crossbody Bag',
  'Organic Face Cream', 'Stainless Steel Water Bottle', 'Yoga Mat Premium', 'LED Desk Lamp',
  'Portable Power Bank 20000mAh', 'Cotton T-Shirt Classic', 'Wireless Mouse Ergonomic', 'Coffee Maker 12-Cup',
  'Noise Cancelling Earbuds', 'Sports Backpack 30L', 'Mechanical Keyboard RGB', 'Bluetooth Speaker',
  'Running Shorts Lightweight', 'Sunglasses Polarized', 'Fitness Tracker Band', 'Laptop Stand Aluminum',
  'Skincare Serum Vitamin C', 'Wireless Charging Pad', 'Insulated Lunch Box', 'Gaming Mouse Pad XL',
  'Minimalist Wallet', 'Phone Holder Car Mount', 'Resistance Bands Set', 'Aromatherapy Diffuser',
  'Cotton Socks Pack 5', 'Hair Dryer Ionic', 'Electric Toothbrush', 'Kitchen Scale Digital',
  'Pillow Memory Foam', 'Desk Organizer Set', 'Cable Management Box', 'Notebook Set 3-Pack',
  'Pen Set Gel Ink', 'Desk Plant Succulent', 'Wall Art Canvas Print', 'Throw Blanket Soft',
  'Sneakers Casual Low', 'Hoodie Fleece Zip', 'Denim Jacket Classic', 'Formal Oxford Shoes',
  'Backpack School 15"', 'Slim Wallet RFID', 'Watch Chronograph', 'Belt Leather Casual',
  'Umbrella Compact', 'Travel Pillow Neck', 'Luggage Tag Set', 'Passport Holder',
  'Protein Shaker Bottle', 'Kettlebell 8kg', 'Jump Rope Speed', 'Foam Roller',
  'Hand Gripper', 'Ankle Weights Pair', 'Exercise Ball 65cm', 'Pull Up Bar Door',
  'Baby Onesie Pack', 'Kids Puzzle 100pc', 'Board Game Family', 'Action Figure Collectible',
  'Coloring Book Set', 'Building Blocks 200pc', 'Stuffed Toy Plush', 'Outdoor Ball',
  'Cereal Oats 500g', 'Honey Jar 250g', 'Olive Oil 500ml', 'Pasta Pack 1kg',
  'Green Tea Box 25', 'Snack Mix 200g', 'Protein Bar Box 12', 'Nut Mix 300g',
  'USB-C Hub 7-in-1', 'Webcam HD 1080p', 'Monitor Arm Mount', 'Laptop Sleeve 13"',
  'Tablet Stand Adjustable', 'Screen Cleaner Kit', 'HDMI Cable 2m', 'USB Flash Drive 64GB',
  'Desk Mat Extended', 'Sticky Notes Pack', 'Highlighters Set', 'File Folders Pack',
  'Earrings Stud Silver', 'Bracelet Leather', 'Necklace Pendant', 'Ring Sterling',
  'Sunscreen SPF 50', 'Lip Balm Pack 3', 'Hand Cream 50ml', 'Face Mask Sheet 5pc',
  'Shampoo 400ml', 'Conditioner 400ml', 'Body Lotion 250ml', 'Deodorant Roll-On',
  'Coffee Beans 1kg', 'Tea Assorted 20 Bags', 'Mug Insulated', 'French Press 1L',
  'Cutting Board Bamboo', 'Knife Set 5-Piece', 'Mixing Bowl Set', 'Spatula Silicone',
  'Bed Sheet Set King', 'Towel Set 6-Piece', 'Cushion Cover Set', 'Curtains Pair',
  'Plant Pot Ceramic', 'Garden Tool Set', 'Seeds Herb Kit', 'Watering Can',
  'Flashlight LED', 'Multi-Tool Pocket', 'First Aid Kit', 'Fire Extinguisher',
  'Bicycle Lock Cable', 'Helmet Adult', 'Bottle Cage', 'Pump Mini',
  'Camping Tent 2-Person', 'Sleeping Bag', 'Camping Chair', 'Cooler 20L',
];

function pick(arr, n = 1) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.floor(Math.random() * arr.length)]);
  return n === 1 ? out[0] : out;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedCategories() {
  const created = [];
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    const existing = await Category.findOne({ name: c.name });
    if (existing && !process.env.SEED_DEMO_FORCE) {
      created.push(existing);
      continue;
    }
    const slug = await createUniqueCategorySlug(c.name, existing?._id);
    const image = U(CATEGORY_IMAGES[i % CATEGORY_IMAGES.length], 400);
    const cat = await Category.findOneAndUpdate(
      { name: c.name },
      { name: c.name, slug, description: c.description, image, order: c.order, isActive: true, parent: null },
      { upsert: true, new: true }
    );
    created.push(cat);
    console.log(`  Category: ${cat.name}`);
  }
  return created;
}

async function seedBrands() {
  const created = [];
  const seen = new Set();
  for (const b of BRANDS) {
    if (seen.has(b.name)) continue;
    seen.add(b.name);
    const existing = await Brand.findOne({ name: b.name });
    if (existing && !process.env.SEED_DEMO_FORCE) {
      created.push(existing);
      continue;
    }
    const slug = await createUniqueBrandSlug(b.name, existing?._id);
    const image = U(pick(PRODUCT_IMAGES), 400);
    const brand = await Brand.findOneAndUpdate(
      { name: b.name },
      { name: b.name, slug, description: b.description, image, order: created.length, isActive: true },
      { upsert: true, new: true }
    );
    created.push(brand);
    console.log(`  Brand: ${brand.name}`);
  }
  return created;
}

async function seedProducts(categories, brands, adminId) {
  const productTitles = [...PRODUCT_TITLES];
  while (productTitles.length < 110) {
    productTitles.push(`${pick(PRODUCT_TITLES)} ${rand(1, 9)}`);
  }
  let created = 0;
  const existingCount = await Product.countDocuments();
  const targetTotal = 110;
  const toCreate = Math.max(0, targetTotal - existingCount);
  if (toCreate <= 0 && !process.env.SEED_DEMO_FORCE) {
    console.log(`  Products: already ${existingCount}, skipping (set SEED_DEMO_FORCE=1 to re-seed)`);
    return existingCount;
  }
  const toInsert = process.env.SEED_DEMO_FORCE ? productTitles.slice(0, targetTotal) : productTitles.slice(0, toCreate);
  for (let i = 0; i < toInsert.length; i++) {
    const title = toInsert[i];
    const slug = await createUniqueProductSlug(title);
    const category = pick(categories);
    const brand = pick(brands);
    const price = rand(199, 19999);
    const comparePrice = price + rand(100, 500);
    const discount = rand(0, 40);
    const imgId = pick(PRODUCT_IMAGES);
    const imageUrl = U(imgId, 600);
    const images = [
      { url: imageUrl, alt: title },
      { url: U(pick(PRODUCT_IMAGES), 600), alt: `${title} view 2` },
    ];
    const sku = `SKU-${Date.now()}-${rand(1000, 9999)}`;
    const product = {
      title,
      slug,
      description: `${title} - Premium quality product. Perfect for daily use. Great value for money. Order now and get fast delivery.`,
      shortDescription: `${title}. Premium quality.`,
      price,
      comparePrice,
      discount,
      images,
      thumbnail: imageUrl,
      category: category._id,
      brand: brand.name,
      sku,
      stock: rand(5, 200),
      lowStockThreshold: 10,
      tags: [category.name, brand.name, 'online', 'shop'].concat(title.split(' ').slice(0, 3)),
      isActive: true,
      isFeatured: rand(1, 10) <= 2,
      isFlashDeal: rand(1, 10) <= 1,
      flashDealExpiry: rand(1, 10) <= 1 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined,
      ratings: { average: Number((3 + Math.random() * 2).toFixed(1)), count: rand(0, 50) },
      totalSales: rand(0, 100),
      createdBy: adminId,
    };
    await Product.findOneAndUpdate({ slug: product.slug }, product, { upsert: true, new: true });
    created++;
    if (created % 25 === 0) console.log(`  Products: ${created}...`);
  }
  console.log(`  Products: ${created} created (total now: ${existingCount + created})`);
  return existingCount + created;
}

async function run() {
  await connectDB();
  console.log('Connected to DB\n');

  const admin = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
  const adminId = admin ? admin._id : null;

  console.log('Seeding categories...');
  const categories = await seedCategories();
  console.log(`  Total categories: ${categories.length}\n`);

  console.log('Seeding brands...');
  const brands = await seedBrands();
  console.log(`  Total brands: ${brands.length}\n`);

  console.log('Seeding products (100+)...');
  const productCount = await seedProducts(categories, brands, adminId);

  console.log('\n🎉 Demo seed complete!');
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Brands: ${brands.length}`);
  console.log(`   Products: ${productCount}`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
