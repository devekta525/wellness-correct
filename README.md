# Wellness Fuel — Full-Stack E-Commerce Platform

A production-ready, feature-rich MERN e-commerce platform built for health & wellness supplements. Includes a customer storefront, a doctor consultation portal, and a comprehensive admin panel.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Running the App](#running-the-app)
7. [Database Seeding](#database-seeding)
8. [Admin Panel](#admin-panel)
9. [Customer Features](#customer-features)
10. [Doctor Portal](#doctor-portal)
11. [API Reference](#api-reference)
12. [Payment Gateways](#payment-gateways)
13. [Shipping Providers](#shipping-providers)
14. [Legal Pages](#legal-pages)
15. [File Upload & Storage](#file-upload--storage)
16. [Caching (Redis)](#caching-redis)
17. [Authentication & Security](#authentication--security)
18. [Frontend State & Storage](#frontend-state--storage)
19. [Deployment](#deployment)

---

## Project Overview

Wellness Fuel is a full-stack MERN e-commerce application tailored for a health supplement brand. It supports:

- **Multi-role users** — Customer, Doctor, Admin (superadmin)
- **Multiple payment gateways** — Razorpay, Stripe, Cashfree, PayU, COD
- **Multiple shipping providers** — Shiprocket, Delhivery, BlueDart
- **AI-powered features** — OpenAI integration for product recommendations and content studio
- **Doctor consultation booking** — Customers can browse and book video/chat consultations
- **Dynamic legal pages** — Privacy Policy, Terms & Conditions, Return Policy, FAQ — all editable from the admin panel
- **Click tracking & analytics** — Session-level click tracking with heatmap analytics
- **Referral system** — Multi-level referral tracking with commission management
- **Abandoned cart recovery** — Automatic detection and recovery workflows
- **Blog / CMS** — Full-featured blog with rich-text editing
- **Real-time notifications** — Admin push notification management
- **Reports & Exports** — Excel exports for orders, customers, and inventory

---

## Tech Stack

### Frontend (`/client`)

| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI framework |
| Redux Toolkit | 2.1 | Global state management |
| React Router v6 | 6.21 | Client-side routing |
| Tailwind CSS | 3.4 | Utility-first styling |
| Framer Motion | 11 | Animations & scroll transitions |
| Swiper | 11 | Carousels & sliders |
| Recharts | 2.10 | Admin analytics charts |
| Axios | 1.6 | HTTP client with interceptors |
| Lucide React | 0.323 | Icon library |
| React Hot Toast | 2.4 | Toast notifications |
| React Quill | 2.0 | Rich text editor (blogs) |
| React Dropzone | 14.2 | Drag-and-drop file uploads |
| JS Cookie | 3.0 | Cookie management |
| Date-fns | 3.2 | Date formatting |

### Backend (`/server`)

| Technology | Version | Purpose |
|---|---|---|
| Node.js / Express | 4.18 | REST API server |
| MongoDB / Mongoose | 8.0 | Primary database |
| Redis | 4.6 | Caching layer |
| JWT (jsonwebtoken) | 9.0 | Auth token generation |
| bcryptjs | 2.4 | Password hashing |
| Cloudinary | 1.41 | Image storage & CDN |
| Stripe | 14.7 | Payment processing |
| Nodemailer | 6.9 | Transactional email |
| OpenAI | 4.20 | AI content & recommendations |
| Helmet | 7.1 | HTTP security headers |
| express-mongo-sanitize | 2.2 | NoSQL injection prevention |
| express-rate-limit | 7.1 | API rate limiting |
| Sharp | 0.33 | Image optimization |
| Winston | 3.11 | Logging |
| ExcelJS | 4.4 | Excel report generation |
| Multer | 1.4 | File upload middleware |

---

## Project Structure

```
E-comm/
├── package.json                        # Root — concurrently scripts
├── .env.example                        # Environment variable template
│
├── client/                             # React frontend (CRA)
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── admin/
│       │   │   └── AdminLayout.jsx          # Admin sidebar + top header
│       │   ├── common/
│       │   │   ├── AdminRoute.jsx            # Admin auth guard
│       │   │   ├── ProtectedRoute.jsx        # Customer auth guard
│       │   │   └── Loader.jsx
│       │   ├── customer/
│       │   │   ├── CustomerLayout.jsx
│       │   │   ├── Navbar.jsx                # Announcement bar + main nav
│       │   │   └── Footer.jsx
│       │   └── doctor/
│       │       └── DoctorLayout.jsx
│       ├── context/
│       │   └── SiteContext.jsx               # Site config (logo, social, settings)
│       ├── pages/
│       │   ├── admin/                        # 26 admin pages
│       │   │   ├── DashboardPage.jsx             # KPIs, revenue chart, recent orders
│       │   │   ├── AdminProductsPage.jsx          # Product CRUD list
│       │   │   ├── AddEditProductPage.jsx          # Product form (create / edit)
│       │   │   ├── AdminInventoryPage.jsx          # Stock management
│       │   │   ├── AdminOrdersPage.jsx             # Order list & status management
│       │   │   ├── AdminCustomersPage.jsx          # Customer accounts
│       │   │   ├── AdminCategoriesPage.jsx         # Category CRUD
│       │   │   ├── AdminBrandsPage.jsx             # Brand CRUD
│       │   │   ├── AdminCouponsPage.jsx            # Discount codes
│       │   │   ├── AdminReviewsPage.jsx            # Review moderation
│       │   │   ├── AdminAnalyticsPage.jsx          # Traffic & sales analytics
│       │   │   ├── AdminReportsPage.jsx            # Excel export reports
│       │   │   ├── AdminBlogsPage.jsx              # Blog CMS
│       │   │   ├── AdminContactPage.jsx            # Contact form submissions
│       │   │   ├── AdminDoctorsPage.jsx            # Doctor verification
│       │   │   ├── AdminNotificationsPage.jsx      # Push notifications
│       │   │   ├── AdminSettingsPage.jsx           # Platform settings
│       │   │   ├── AdminLegalPagesPage.jsx         # Legal page editor (Privacy, T&C, Returns, FAQ)
│       │   │   ├── AISettingsPage.jsx              # OpenAI configuration
│       │   │   ├── GatewaySettingsPage.jsx         # Payment & shipping gateways
│       │   │   ├── CustomizationPage.jsx           # Logo, favicon, colors
│       │   │   ├── StudioPage.jsx                  # AI content studio
│       │   │   ├── ReferralDashboardPage.jsx       # Referral program
│       │   │   ├── AbandonedCartsPage.jsx          # Cart recovery
│       │   │   ├── ClickTrackingPage.jsx           # Click analytics
│       │   │   └── AdminLoginPage.jsx
│       │   ├── customer/                     # 30 customer-facing pages
│       │   │   ├── HomePage.jsx                   # Hero, products, deals, testimonials
│       │   │   ├── ProductDetailPage.jsx          # Images, variants, reviews
│       │   │   ├── CategoryPage.jsx               # Filtered product listing
│       │   │   ├── BrandPage.jsx                  # Brand products
│       │   │   ├── SearchPage.jsx                 # Full-text search + filters
│       │   │   ├── CartPage.jsx
│       │   │   ├── CheckoutPage.jsx               # Address + payment
│       │   │   ├── OrderConfirmationPage.jsx
│       │   │   ├── OrderTrackingPage.jsx
│       │   │   ├── OrdersPage.jsx                 # Order history
│       │   │   ├── WishlistPage.jsx
│       │   │   ├── ProfilePage.jsx                # Address book
│       │   │   ├── SettingsPage.jsx               # Password, dark mode
│       │   │   ├── AboutPage.jsx
│       │   │   ├── SciencePage.jsx                # Research & ingredients
│       │   │   ├── ContactPage.jsx
│       │   │   ├── BlogsPage.jsx
│       │   │   ├── BlogDetailPage.jsx
│       │   │   ├── ConsultationPage.jsx           # Browse doctors
│       │   │   ├── DoctorBookPage.jsx             # Book a consultation
│       │   │   ├── MyConsultationsPage.jsx
│       │   │   ├── PrivacyPolicyPage.jsx          # Dynamic — editable from admin
│       │   │   ├── TermsPage.jsx                  # Dynamic — editable from admin
│       │   │   ├── ReturnPolicyPage.jsx           # Dynamic — editable from admin
│       │   │   ├── FaqPage.jsx                    # Dynamic FAQ with search
│       │   │   ├── LoginPage.jsx
│       │   │   ├── RegisterPage.jsx
│       │   │   ├── ForgotPasswordPage.jsx
│       │   │   ├── SplashScreen.jsx
│       │   │   └── WelcomePage.jsx
│       │   └── doctor/
│       │       ├── DoctorProfileSetup.jsx
│       │       ├── DoctorDashboard.jsx
│       │       └── DoctorPrescriptionPage.jsx
│       ├── services/
│       │   └── api.js                       # All API calls — organized by domain
│       ├── store/
│       │   └── slices/
│       │       ├── authSlice.js
│       │       ├── cartSlice.js
│       │       └── productSlice.js
│       └── App.jsx                          # Root router (BrowserRouter)
│
└── server/                             # Node/Express backend
    ├── config/
    │   ├── db.js                            # MongoDB connection
    │   ├── redis.js                         # Redis connection
    │   └── cloudinary.js                    # Cloudinary + multer config
    ├── controllers/
    │   ├── adminController.js               # Dashboard stats, users, settings
    │   ├── authController.js                # Login, register, JWT
    │   ├── productController.js
    │   ├── orderController.js
    │   ├── categoryController.js
    │   ├── brandController.js
    │   ├── blogController.js
    │   ├── couponController.js
    │   ├── reviewController.js
    │   ├── doctorController.js
    │   ├── paymentController.js
    │   ├── shippingController.js
    │   ├── referralController.js
    │   ├── aiController.js
    │   ├── reportController.js
    │   ├── clickTrackingController.js
    │   ├── abandonedCartController.js
    │   ├── customizationController.js
    │   └── legalController.js               # Legal pages — get & update
    ├── middleware/
    │   ├── auth.js                          # protect + admin guards
    │   ├── errorHandler.js
    │   └── rateLimiter.js
    ├── models/
    │   ├── User.js
    │   ├── Product.js
    │   ├── Order.js
    │   ├── Category.js
    │   ├── Brand.js
    │   ├── Blog.js
    │   ├── Cart.js
    │   ├── Coupon.js
    │   ├── Review.js
    │   ├── Notification.js
    │   ├── Settings.js                      # Key-value store (gateways, legal, site config)
    │   ├── Consultation.js
    │   ├── DoctorProfile.js
    │   ├── Prescription.js
    │   ├── MedicineList.js
    │   ├── ReferralCode.js
    │   ├── ReferralTracking.js
    │   └── ClickEvent.js
    ├── routes/
    │   ├── admin.js                         # All /api/admin/* routes (auth guarded)
    │   ├── auth.js
    │   ├── products.js
    │   ├── categories.js
    │   ├── brands.js
    │   ├── orders.js
    │   ├── reviews.js
    │   ├── blogs.js
    │   ├── coupons.js
    │   ├── doctors.js
    │   ├── payments.js
    │   ├── shipping.js
    │   ├── referral.js
    │   ├── tracking.js
    │   ├── site.js
    │   └── legal.js                         # Public GET /api/legal/:page
    ├── services/
    │   ├── payment/
    │   │   ├── gateways/
    │   │   │   ├── razorpay.js
    │   │   │   ├── stripe.js
    │   │   │   ├── cashfree.js
    │   │   │   └── payu.js
    │   │   └── paymentManager.js
    │   └── shipping/
    │       ├── providers/
    │       │   ├── shiprocket.js
    │       │   ├── delhivery.js
    │       │   └── bluedart.js
    │       └── shippingManager.js
    ├── utils/
    │   ├── seeder.js                        # Admin user seeder
    │   ├── seed-demo.js                     # Demo products, categories, brands
    │   └── seed-reviews.js                  # Sample reviews
    └── server.js                            # Express entry point
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (Atlas or local)
- Redis (optional — app works without it)
- npm

### Installation

```bash
# From the project root
npm run install-all
```

This installs dependencies for the root, server, and client in one command.

Or manually:

```bash
npm install                   # root (concurrently)
cd server && npm install
cd ../client && npm install
```

---

## Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example server/.env
```

```env
# ── Server ────────────────────────────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── MongoDB ───────────────────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/wellness_fuel

# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# ── Redis (optional — caching disabled gracefully if not set) ─────────────────
REDIS_URL=redis://localhost:6379

# ── Cloudinary (image storage & CDN) ─────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Stripe ────────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── Email / Nodemailer ────────────────────────────────────────────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Wellness Fuel <noreply@wellnessfuel.com>

# ── OpenAI (AI features & Studio) ────────────────────────────────────────────
OPENAI_API_KEY=sk-...

# ── App ───────────────────────────────────────────────────────────────────────
CLIENT_URL=http://localhost:3000
APP_NAME=Wellness Fuel

# ── Admin defaults (auto-created on first server start) ──────────────────────
ADMIN_EMAIL=admin@wellnessfuel.com
ADMIN_PASSWORD=Admin@123
```

> **Note:** The server automatically creates a superadmin account using `ADMIN_EMAIL` / `ADMIN_PASSWORD` on first startup if one doesn't exist yet.

---

## Running the App

### Development — both servers at once (recommended)

```bash
# From the project root
npm start
```

This uses `concurrently` to run:
- **API server** on port **5000** (`nodemon server/server.js`)
- **React client** on port **3000** (proxies `/api` → `http://localhost:5000`)

### Individual servers

```bash
npm run server      # API only (port 5000)
npm run client      # React only (port 3000)
```

> Running the client alone will fail API requests since the backend won't be running.

### Production build

```bash
npm run build                         # Builds React into client/build/
cd server && NODE_ENV=production npm start   # Express serves the build
```

### Scripts reference

| Command | Description |
|---|---|
| `npm start` | Start both server and client (development) |
| `npm run server` | Start API server only |
| `npm run client` | Start React client only |
| `npm run build` | Build React for production |
| `npm run install-all` | Install all dependencies (root + server + client) |
| `cd server && npm run dev` | Start server with nodemon |
| `cd server && npm run seed` | Seed admin user |
| `cd server && npm run seed:demo` | Seed demo products, categories, brands |
| `cd server && npm run seed:reviews` | Seed sample reviews |

---

## Database Seeding

```bash
cd server

npm run seed          # Creates the superadmin user
npm run seed:demo     # Populates demo products, categories, and brands
npm run seed:reviews  # Adds sample product reviews
```

The admin user is also **auto-seeded on every server start** — if no user with `ADMIN_EMAIL` exists, it is created automatically.

---

## Admin Panel

**URL:** `http://localhost:3000/admin`

**Default credentials:**
```
Email:    admin@wellnessfuel.com
Password: Admin@123
```

### Admin Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | `/admin/dashboard` | Revenue KPIs, sales chart, recent orders, low stock alerts |
| Products | `/admin/products` | Full product CRUD with image management |
| Inventory | `/admin/inventory` | Stock levels, low-stock management |
| Categories | `/admin/categories` | Category CRUD with slug |
| Brands | `/admin/brands` | Brand CRUD |
| Orders | `/admin/orders` | Order list, status updates, tracking |
| Customers | `/admin/customers` | User accounts, roles, activity |
| Coupons | `/admin/coupons` | Discount code management |
| Reviews | `/admin/reviews` | Approve / reject / delete reviews |
| Analytics | `/admin/analytics` | Traffic, conversion, revenue analytics |
| Reports | `/admin/reports` | Export orders, customers, inventory to Excel |
| Referral | `/admin/referral` | Referral codes, commission tracking |
| Abandoned Carts | `/admin/abandoned-carts` | Detect and recover abandoned carts |
| Click Tracking | `/admin/click-tracking` | Session-level click heatmap analytics |
| Blog Posts | `/admin/blogs` | Rich-text blog CMS |
| Contact Page | `/admin/contact` | View contact form submissions |
| Doctors | `/admin/doctors` | Verify doctors, manage consultations |
| **Legal Pages** | `/admin/legal-pages` | Edit Privacy Policy, T&C, Return Policy, FAQ |
| Notifications | `/admin/notifications` | Create and manage push notifications |
| Customization | `/admin/customization` | Logo, dark logo, favicon, brand colors, social links |
| Studio | `/admin/studio` | AI-powered content generation |
| Settings | `/admin/settings` | Currency, shipping thresholds, tax rate |
| AI Settings | `/admin/ai-settings` | OpenAI API key and model configuration |
| Gateway Settings | `/admin/gateway-settings` | Payment gateway and shipping provider configs |

---

## Customer Features

### All Customer Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Home | No |
| `/category/:slug` | Category listing | No |
| `/brand/:slug` | Brand products | No |
| `/product/:slug` | Product detail | No |
| `/search` | Search with filters | No |
| `/cart` | Shopping cart | No |
| `/checkout` | Checkout | No |
| `/order-confirmation/:id` | Order confirmation | No |
| `/blogs` | Blog listing | No |
| `/blog/:slug` | Blog article | No |
| `/about` | About Wellness Fuel | No |
| `/science` | Research & ingredients | No |
| `/contact` | Contact form | No |
| `/consultation` | Browse doctors | No |
| `/consultation/:id` | Book a doctor | No |
| `/privacy-policy` | Privacy Policy | No |
| `/terms` | Terms & Conditions | No |
| `/return-policy` | Return & Refund Policy | No |
| `/faq` | FAQ (with live search) | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/forgot-password` | Password reset | No |
| `/orders` | Order history | Yes |
| `/orders/:id` | Order tracking | Yes |
| `/wishlist` | Saved products | Yes |
| `/profile` | Profile & address book | Yes |
| `/settings` | Account settings | Yes |
| `/my-consultations` | Consultation history | Yes |

### Notable UX Features

- **Splash screen** — Shown once per browser using `wf_visited` in localStorage
- **Persistent cart** — Synced to backend for logged-in users; `wf_cart` for guests
- **Dark mode** — Toggled via settings, persisted in `localStorage`
- **Recent searches** — Stored under `wf_recent_searches`
- **Referral links** — `?ref=CODE` in URL sets referral cookie for 30 days
- **Global click tracking** — All anchor/button clicks tracked with session IDs for analytics

---

## Doctor Portal

Doctors log in through the same customer login (`/login`) but are routed to a separate layout:

| Route | Page | Description |
|---|---|---|
| `/doctor/setup` | Profile Setup | Bio, availability slots, consultation fee |
| `/doctor/dashboard` | Dashboard | Upcoming consultations, patient list |
| `/doctor/prescription/:id` | Prescription | Write and send prescriptions to patients |

Doctors are created/verified by admins through **Admin → Doctors**.

---

## API Reference

All endpoints are prefixed with `/api`. All admin endpoints require a valid JWT with role `admin` or `superadmin`.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register customer |
| POST | `/auth/login` | — | Customer login |
| POST | `/auth/admin/login` | — | Admin / superadmin login |
| GET | `/auth/me` | JWT | Get current user profile |
| PUT | `/auth/profile` | JWT | Update profile |
| PUT | `/auth/change-password` | JWT | Change password |
| POST | `/auth/forgot-password` | — | Send password reset email |
| POST | `/auth/reset-password/:token` | — | Reset password |
| POST | `/auth/addresses` | JWT | Add address |
| POST | `/auth/wishlist/:productId` | JWT | Toggle wishlist item |

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | — | List with filters & pagination |
| GET | `/products/:slug` | — | Product detail |
| GET | `/products/featured` | — | Featured products |
| GET | `/products/flash-deals` | — | Flash deal products |
| GET | `/admin/products` | Admin | Admin product list |
| GET | `/admin/products/:id` | Admin | Product by ID |
| POST | `/admin/products` | Admin | Create product |
| PUT | `/admin/products/:id` | Admin | Update product |
| DELETE | `/admin/products/:id` | Admin | Delete product |
| POST | `/admin/upload` | Admin | Upload images to Cloudinary |

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders` | JWT | Place order |
| GET | `/orders/my` | JWT | My order history |
| GET | `/orders/:id` | JWT | Order detail |
| GET | `/admin/orders` | Admin | All orders |
| PUT | `/admin/orders/:id` | Admin | Update order status |

### Legal Pages

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/legal/:page` | — | Get page content (public) |
| GET | `/admin/legal/:page` | Admin | Get page content (admin) |
| PUT | `/admin/legal/:page` | Admin | Update page content |

**Valid `:page` values:** `privacy_policy` · `terms` · `return_policy` · `faq`

**Privacy / Terms / Return Policy response:**
```json
{
  "success": true,
  "page": "privacy_policy",
  "content": {
    "title": "Privacy Policy",
    "lastUpdated": "March 10, 2026",
    "intro": "...",
    "sections": [
      { "id": "s1", "heading": "Information We Collect", "content": "..." }
    ]
  }
}
```

**FAQ response:**
```json
{
  "success": true,
  "page": "faq",
  "content": {
    "title": "Frequently Asked Questions",
    "lastUpdated": "March 10, 2026",
    "intro": "...",
    "categories": [
      {
        "id": "c1",
        "name": "Orders & Shipping",
        "items": [
          { "id": "q1", "question": "How long does delivery take?", "answer": "3-7 business days." }
        ]
      }
    ]
  }
}
```

### Admin Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/dashboard` | Admin | KPIs, charts, low-stock list |
| GET | `/admin/users` | Admin | Customer accounts |
| PUT | `/admin/users/:id` | Admin | Update user role/status |
| GET | `/admin/settings` | Admin | Platform settings |
| PUT | `/admin/settings` | Admin | Update settings |
| GET | `/admin/analytics/sales` | Admin | Sales time-series data |

---

## Payment Gateways

Configure under **Admin → Gateway Settings → Payments**.

| Gateway | Method | Best For |
|---|---|---|
| **Razorpay** | JS popup | India — all payment methods |
| **Stripe** | Redirect | International cards |
| **Cashfree** | SDK | UPI, wallets, cards |
| **PayU** | Form redirect | India |
| **COD** | — | Cash on Delivery |

Settings are stored in MongoDB `Settings` collection with keys like `gateway_payment_razorpay`.

**Config structure:**
```json
{
  "enabled": true,
  "mode": "test",
  "config": {
    "keyId": "rzp_test_...",
    "keySecret": "..."
  }
}
```

---

## Shipping Providers

Configure under **Admin → Gateway Settings → Shipping**.

| Provider | Config Key |
|---|---|
| Shiprocket | `gateway_shipping_shiprocket` |
| Delhivery | `gateway_shipping_delhivery` |
| BlueDart | `gateway_shipping_bluedart` |

---

## Legal Pages

All 4 legal pages are **fully dynamic** — content is stored in MongoDB and editable by the admin with no code changes required.

| Page | Customer URL | Default content |
|---|---|---|
| Privacy Policy | `/privacy-policy` | Ships with full default content |
| Terms & Conditions | `/terms` | Ships with full default content |
| Return & Refund Policy | `/return-policy` | Ships with full default content |
| FAQ | `/faq` | Ships with 4 categories, 14 Q&As |

**Admin editor** (`/admin/legal-pages`) features:
- Tabbed interface for all 4 pages
- Add / edit / delete / reorder sections (Privacy, Terms, Returns)
- Manage FAQ categories and Q&A pairs independently
- Live preview button opens the customer page in a new tab
- Changes take effect immediately on save

**Storage:** `Settings` MongoDB collection — keys `legal_privacy_policy`, `legal_terms`, `legal_return_policy`, `legal_faq`.

---

## File Upload & Storage

All media is uploaded to **Cloudinary**.

- Product images: up to 10 per product via `POST /api/admin/upload`
- Site assets (logo, favicon, banner): via Admin → Customization
- Blog images: via the rich-text blog editor

Configure Cloudinary credentials in `server/.env`.

---

## Caching (Redis)

Redis caches frequently-accessed data such as product listings, categories, and dashboard stats. The app **degrades gracefully** if Redis is unavailable — all endpoints remain functional, just without caching.

Set `REDIS_URL` in `server/.env` to enable. Default: `redis://localhost:6379`.

---

## Authentication & Security

| Mechanism | Detail |
|---|---|
| **JWT** | 7-day expiry; stored in `localStorage` as `Wellness_fuel_token` |
| **Roles** | `customer`, `doctor`, `admin`, `superadmin` |
| **Admin guard** | All `/api/admin/*` routes require admin or superadmin role |
| **Rate limiting** | 5000 req/15 min (dev), 500 req/15 min (prod) |
| **Helmet** | Sets secure HTTP response headers |
| **MongoDB sanitize** | Prevents NoSQL injection attacks |
| **Bcrypt** | Passwords hashed with bcryptjs |
| **CORS** | Restricted to `CLIENT_URL` origin |

---

## Frontend State & Storage

### localStorage keys

| Key | Purpose |
|---|---|
| `Wellness_fuel_token` | JWT auth token |
| `wf_cart` | Guest cart persistence |
| `wf_visited` | Splash screen seen flag |
| `wf_recent_searches` | Recent search history |
| `darkMode` | Dark mode preference |

### Redux Store slices

| Slice | Key state |
|---|---|
| `auth` | `user`, `initialized`, `loading` |
| `cart` | `items`, `referralCode` |
| `product` | `categories`, `brands` |

### API service (`client/src/services/api.js`)

All API calls are organized into named exports:

```
authAPI       productAPI      categoryAPI    brandAPI
orderAPI      reviewAPI       couponAPI      referralAPI
aiAPI         siteAPI         adminAPI       paymentAPI
shippingAPI   doctorAPI       blogAPI        contactAPI
trackingAPI   abandonedCartAPI  clickTrackingAPI  legalAPI
```

---

## Deployment

### Build for production

```bash
# 1. Build the React app
npm run build

# 2. Start the server (serves static files + API)
cd server
NODE_ENV=production npm start
```

In production mode, Express serves `client/build/index.html` for all non-API routes.

### Recommended infrastructure

| Service | Purpose |
|---|---|
| MongoDB Atlas | Database |
| Redis Cloud / Upstash | Caching |
| Cloudinary | Image CDN |
| Railway / Render / AWS EC2 | Server hosting |
| Vercel / Netlify | Optional: separate static frontend |

### Health check endpoint

```
GET /api/health
→ { "status": "OK", "app": "Wellness_fuel", "version": "1.0.0", "timestamp": "..." }
```

---

## Branding

- **Brand name:** Wellness Fuel
- **Primary color:** Tailwind Blue (`blue-600` → `blue-950`)
- **Accent color:** Amber / Gold (`#d97706`)
- **Flagship products:** Super Food Blend · Marine Collagen · Glutathione Tablet · Shilajit Coffee · Shilajit Resin

---

*Wellness Fuel — Fuel your body, fuel your life.*
