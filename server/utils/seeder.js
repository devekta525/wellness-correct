require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Settings = require('../models/Settings');

const seed = async () => {
  await connectDB();
  console.log('Connected to DB');

  // Create superadmin
  const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!adminExists) {
    await User.create({
      name: 'Super Admin',
      email: process.env.ADMIN_EMAIL || 'admin@Wellness_fuel.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'superadmin',
      isActive: true,
    });
    console.log('✅ Admin user created:', process.env.ADMIN_EMAIL);
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Create default categories (image URLs from Picsum for consistent placeholder images)
  const categories = [
    { name: 'Electronics', icon: '📱', description: 'Gadgets and electronic devices', image: 'https://picsum.photos/seed/electronics/400/400' },
    { name: 'Fashion', icon: '👗', description: 'Clothing and accessories', image: 'https://picsum.photos/seed/fashion/400/400' },
    { name: 'Home & Kitchen', icon: '🏠', description: 'Home decor and kitchen appliances', image: 'https://picsum.photos/seed/homekitchen/400/400' },
    { name: 'Books', icon: '📚', description: 'Books, magazines, and stationery', image: 'https://picsum.photos/seed/books/400/400' },
    { name: 'Sports & Fitness', icon: '⚽', description: 'Sports equipment and fitness gear', image: 'https://picsum.photos/seed/sports/400/400' },
    { name: 'Beauty & Health', icon: '💄', description: 'Beauty products and health care', image: 'https://picsum.photos/seed/beauty/400/400' },
    { name: 'Toys & Games', icon: '🧸', description: 'Toys and gaming products', image: 'https://picsum.photos/seed/toys/400/400' },
    { name: 'Grocery', icon: '🛒', description: 'Daily groceries and food items', image: 'https://picsum.photos/seed/grocery/400/400' },
  ];

  for (const cat of categories) {
    const exists = await Category.findOne({ name: cat.name });
    if (!exists) {
      const slug = cat.name.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, 'and');
      await Category.create({ ...cat, slug });
      console.log(`✅ Category created: ${cat.name}`);
    } else {
      // Update existing category to add image if missing
      if (!exists.image && cat.image) {
        await Category.findByIdAndUpdate(exists._id, { image: cat.image });
        console.log(`✅ Category image updated: ${cat.name}`);
      }
    }
  }

  // Default settings
  const defaultSettings = [
    { key: 'site_name', value: 'Wellness_fuel', group: 'general' },
    { key: 'site_tagline', value: 'AI-Powered Shopping', group: 'general' },
    { key: 'currency', value: 'INR', group: 'general' },
    { key: 'currency_symbol', value: '₹', group: 'general' },
    { key: 'free_shipping_threshold', value: 999, group: 'shipping' },
    { key: 'standard_shipping_cost', value: 49, group: 'shipping' },
    { key: 'tax_rate', value: 18, group: 'tax' },
    { key: 'attribution_model', value: 'last_click', group: 'referral' },
    { key: 'openai_model', value: 'gpt-4o', group: 'ai' },
  ];

  for (const setting of defaultSettings) {
    await Settings.findOneAndUpdate({ key: setting.key }, setting, { upsert: true });
  }
  console.log('✅ Default settings created');

  console.log('\n🎉 Seeding complete!');
  console.log(`📧 Admin: ${process.env.ADMIN_EMAIL || 'admin@Wellness_fuel.com'}`);
  console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  process.exit(0);
};

seed().catch(err => {
  console.error('Seeder error:', err);
  process.exit(1);
});
