require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');

const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brands');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const couponRoutes = require('./routes/coupons');
const referralRoutes = require('./routes/referral');
const paymentRoutes = require('./routes/payments');
const shippingRoutes = require('./routes/shipping');
const siteRoutes = require('./routes/site');
const adminRoutes = require('./routes/admin');
const trackingRoutes = require('./routes/tracking');
const blogRoutes = require('./routes/blogs');
const doctorRoutes = require('./routes/doctors');
const legalRoutes = require('./routes/legal');

const app = express();

// Auto-seed admin user after DB connects
const autoSeedAdmin = async () => {
  try {
    const User = require('./models/User');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@Wellness_fuel.com';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'superadmin',
        isActive: true,
      });
      console.log(`✅ Admin user auto-created: ${adminEmail}`);
    }
  } catch (e) {
    // DB may not be ready – run `npm run seed` manually if needed
  }
};

// Connect databases
connectDB().then(autoSeedAdmin).catch(() => { });
connectRedis().catch(() => console.log('Redis unavailable, caching disabled'));

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(mongoSanitize());
app.use(compression());

// CORS
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:3001', 'https://wellnessfuel.in', 'https://www.wellnessfuel.in'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
}));

// Body parsing — Razorpay webhook needs raw body for signature verification (must be before json)
app.use('/api/payments/razorpay/webhook', express.raw({ type: 'application/json' }), require('./controllers/paymentController').razorpayWebhook);
// Also mount at /api/razorpay/webhook (the URL configured on Razorpay dashboard)
app.use('/api/razorpay/webhook', express.raw({ type: 'application/json' }), require('./controllers/paymentController').razorpayWebhook);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', app: 'Wellness_fuel', version: '1.0.0', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/legal', legalRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Wellness_fuel Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Graceful shutdown – don’t exit on Cloudinary/config errors so the rest of the API stays up
process.on('unhandledRejection', (err) => {
  const msg = (err && err.message) ? err.message : String(err);
  const isCloudinaryConfig = msg.includes('cloud_name') || msg.includes('disabled') || (err && err.http_code === 401);
  console.error('Unhandled Rejection:', err);
  if (isCloudinaryConfig) {
    console.error('Cloudinary is misconfigured or disabled. Set CLOUDINARY_* in .env and enable your cloud in the dashboard. Server continuing without exiting.');
    return;
  }
  server.close(() => process.exit(1));
});

module.exports = app;
