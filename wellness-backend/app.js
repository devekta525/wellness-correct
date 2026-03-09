import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

// Security Middleware
import { globalLimiter, strictLimiter } from "./middleware/rateLimiter.js";
import { botBlocker } from "./middleware/botBlocker.js";
import { geoBlocker } from "./middleware/geoBlocker.js";
import { requestLogger, errorLogger, getRecentLogs } from "./middleware/requestLogger.js";
import { ddosProtection, getDDoSStats, getBlacklistedIPs } from "./middleware/ddosProtection.js";

// Route imports
import blogRoute from "./routes/blogRoute.js";
import productRoute from "./routes/productRoutes.js";
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
import ratingRouter from "./routes/ratingRoute.js";
import categoryRoutes from "./routes/categoryRoute.js";
import orderRoutes from './routes/orderRoute.js';
import leadRoutes from './routes/leadRoute.js';
import addressRoutes from './routes/addressRouter.js';
import couponRoutes from './routes/couponRouter.js';
import reviewRoutes from './routes/reviewRouter.js';
import settingRoutes from './routes/settingRoute.js';
import notesRoute from './routes/notesRoute.js';
import sessionRoute from './routes/sessionRoute.js';
import popupRoute from './routes/popupRoute.js'
import newsLetterRoute from './routes/newsLetterRoute.js'
import contactRoute from './routes/contactRoute.js';
import bannerRoute from './routes/bannerRoute.js';
import appointmentRoute from './routes/appointmentRoute.js';
import patientRoute from './routes/patientRoute.js';
import prescriptionRoute from './routes/prescriptionRoute.js';
import reportRoute from './routes/reportRoute.js';
import dashboardRoute from './routes/dashboardRoute.js';
import doctorSettingsRoute from './routes/doctorSettingsRoute.js';
import doctorRoute from './routes/doctorRoute.js';
import customerRoute from './routes/customerRoute.js';
import paymentMethodRoute from './routes/paymentMethodRoute.js';
import razorpayRoute from './routes/razorpayRoute.js';
import totalAmountRoute from './routes/totalAmountRoute.js';
import influencerReferralRoute from './routes/influencerReferralRoute.js';
import influencerNoteRoute from './routes/influencerNoteRoute.js';
import influencerReportRoute from './routes/influencerReportRoute.js';
import influencerSettingsRoute from './routes/influencerSettingsRoute.js';
import influencerRoute from './routes/influencerRoute.js';
import wishlistRoute from './routes/wishlistRoute.js';
import shiprocketRoute from "./routes/shiprocketRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============================================================================
// SECURITY MIDDLEWARE INITIALIZATION - ORDER MATTERS!
// ============================================================================
// 1. Helmet - Must be first to set security headers
app.use(helmet());

// 2. CORS - Allow cross-origin requests
app.use(cors({
    origin: true,
    credentials: true
}));

// 3. Cookie Parser - Parse cookies
app.use(cookieParser());

// 4. Body Parsers - Parse request bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// 5. JSON Parsing Error Handler
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('JSON Parsing Error:', err.message);
        console.error('Request URL:', req.url);
        console.error('Request method:', req.method);
        console.error('Content-Type:', req.headers['content-type']);

        return res.status(400).json({
            success: false,
            message: 'Invalid JSON format in request body',
            error: err.message
        });
    }
    next(err);
});

// 6. Logging Middleware - Log all requests
app.use(requestLogger);

// 7. DDoS Protection - Detect rapid-fire attacks (50 requests in 10 seconds)
app.use(ddosProtection);

// 8. Bot Detection - Block known bots and crawlers
app.use(botBlocker);

// 9. GeoIP Blocking - Allow only traffic from India
app.use(geoBlocker);

// 10. Rate Limiting - Global rate limiter (200 requests per 15 minutes)
app.use(globalLimiter);

// Legacy console logging (can be removed if using requestLogger)
app.use((req, res, next) => {
    console.log(new Date().toISOString(), ':: Request for :', req.url)
    next();
})

// ============================================================================
// STATIC FILES AND ROUTES
// ============================================================================

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes - Most routes use global rate limiter
app.use("/v1/blogs", blogRoute);
app.use("/v1/products", productRoute);
app.use("/v1/users", userRoute);

// Auth routes - Use strict rate limiter (5 attempts per 15 min) for login/register
app.use("/v1/auth", strictLimiter, authRoute);

app.use("/v1/ratings", ratingRouter);
app.use("/v1/categories", categoryRoutes);
app.use('/v1/orders', orderRoutes);
app.use('/v1/leads', leadRoutes);
app.use('/v1/addresses', addressRoutes);
app.use('/v1/coupons', couponRoutes);
app.use('/v1/reviews', reviewRoutes);
app.use('/v1/settings', settingRoutes);
app.use('/v1/notes', notesRoute);
app.use('/v1/sessions', sessionRoute);
app.use('/v1/popups', popupRoute);
app.use('/v1/newsletters', newsLetterRoute);
app.use('/v1/contacts', contactRoute);
app.use('/v1/wishlist', wishlistRoute);
app.use('/v1/banners', bannerRoute);

app.use('/v1/doctor', doctorRoute);
app.use('/v1/appointments', appointmentRoute);
app.use('/v1/patients', patientRoute);
app.use('/v1/prescriptions', prescriptionRoute);
app.use('/v1/reports', reportRoute);
app.use('/v1/dashboard', dashboardRoute);
app.use('/v1/doctor-settings', doctorSettingsRoute);
app.use('/v1/customer', customerRoute);
app.use('/v1/payment-methods', paymentMethodRoute);
app.use('/v1/total-amount', totalAmountRoute)
app.use('/v1/razorpay', razorpayRoute);
app.use('/v1/influencer', influencerRoute);
app.use('/v1/influencer-referrals', influencerReferralRoute);
app.use('/v1/influencer-notes', influencerNoteRoute);
app.use('/v1/influencer-reports', influencerReportRoute);
app.use('/v1/influencer-settings', influencerSettingsRoute);

app.use('/api/webhook', shiprocketRoute);

app.get("/", (req, res) => {
    res.send("API is running....");
});

// ============================================================================
// SECURITY MONITORING ENDPOINTS (Optional - Admin Only)
// ============================================================================
// These endpoints allow you to monitor security metrics
// In production, protect these with authentication middleware

app.get("/admin/security/ddos-stats", (req, res) => {
    // TODO: Add authentication check here
    // if (!req.user?.isAdmin) return res.status(403).json({ message: 'Forbidden' });

    res.json({
        success: true,
        data: getDDoSStats()
    });
});

app.get("/admin/security/blacklisted-ips", (req, res) => {
    // TODO: Add authentication check here
    res.json({
        success: true,
        data: getBlacklistedIPs()
    });
});

app.get("/admin/security/logs", (req, res) => {
    // TODO: Add authentication check here
    const logType = req.query.type || 'all'; // 'all', 'blocked', 'suspicious', 'errors'
    const lines = parseInt(req.query.lines) || 100;

    res.json({
        success: true,
        data: getRecentLogs(logType, lines)
    });
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE - Must be last
// ============================================================================
app.use(errorLogger);

export default app;
