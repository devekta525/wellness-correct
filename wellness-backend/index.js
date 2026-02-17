import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import blogRoute from "./routes/blogRoute.js";
import productRoute from "./routes/productRoutes.js";
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
import dotenv from "dotenv";
import dbConnection from "./config/db.js";
import cors from "cors";
import ratingRouter from "./routes/ratingRoute.js";
import categoryRoutes from "./routes/categoryRoute.js";
import orderRoutes from './routes/orderRoute.js';
import leadRoutes from './routes/leadRoute.js';
import addressRoutes from './routes/addressRouter.js';
import couponRoutes from './routes/couponRouter.js';
import reviewRoutes from './routes/reviewRouter.js';
import cookieParser from "cookie-parser";
import settingRoutes from './routes/settingRoute.js';
import notesRoute from './routes/notesRoute.js';
import sessionRoute from './routes/sessionRoute.js';
import popupRoute from './routes/popupRoute.js'
import newsLetterRoute from './routes/newsLetterRoute.js'
import contactRoute from './routes/contactRoute.js';
//doctor routes
import appointmentRoute from './routes/appointmentRoute.js';
import patientRoute from './routes/patientRoute.js';
import prescriptionRoute from './routes/prescriptionRoute.js';
import reportRoute from './routes/reportRoute.js';
import dashboardRoute from './routes/dashboardRoute.js';
import doctorSettingsRoute from './routes/doctorSettingsRoute.js';
import doctorRoute from './routes/doctorRoute.js';

//customer routes
import customerRoute from './routes/customerRoute.js';
import paymentMethodRoute from './routes/paymentMethodRoute.js';
import razorpayRoute from './routes/razorpayRoute.js';
import totalAmountRoute from './routes/totalAmountRoute.js';

//influencer routes
import influencerReferralRoute from './routes/influencerReferralRoute.js';
import influencerNoteRoute from './routes/influencerNoteRoute.js';
import influencerReportRoute from './routes/influencerReportRoute.js';
import influencerSettingsRoute from './routes/influencerSettingsRoute.js';
import influencerRoute from './routes/influencerRoute.js';

dotenv.config();

dbConnection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 5000;

const app = express();

app.use(cookieParser());

app.use(cors({
  origin: true,
  credentials: true
}));

// Increase payload size limit to handle large FormData and base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// Error handling middleware for JSON parsing errors
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

// Serve static files from uploads directory (for local storage)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/v1/blogs", blogRoute);
app.use("/v1/products", productRoute);
app.use("/v1/users", userRoute);
app.use("/v1/auth", authRoute);
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
//doctor
app.use('/v1/doctor', doctorRoute);
app.use("/v1/appointments", appointmentRoute);
app.use('/v1/patients', patientRoute);
app.use('/v1/prescriptions', prescriptionRoute);
app.use('/v1/reports', reportRoute);
app.use('/v1/dashboard', dashboardRoute);
app.use('/v1/doctor-settings', doctorSettingsRoute);

//customer routes
app.use('/v1/customer', customerRoute);
app.use('/v1/payment-methods', paymentMethodRoute);
app.use('/v1/total-amount',totalAmountRoute )
app.use('/v1/razorpay', razorpayRoute);

//influencer routes
app.use('/v1/influencer', influencerRoute);
app.use('/v1/influencer-referrals', influencerReferralRoute);
app.use('/v1/influencer-notes', influencerNoteRoute);
app.use('/v1/influencer-reports', influencerReportRoute);
app.use('/v1/influencer-settings', influencerSettingsRoute);

app.get("/", (req, res) => {
  res.send("API is running....");
});
app.listen(port, () => {
  console.log("server listen on port: ", port);
});

export default app;
