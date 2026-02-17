# Wellness Backend

## Overview
The backend is an Express + MongoDB API that powers authentication, content, ecommerce, appointments, and role-based dashboards (admin, doctor, influencer, customer). The server entry point is [backend/index.js](backend/index.js).

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication (cookie + Authorization header)
- AWS S3 for file uploads
- Razorpay for payments
- Nodemailer for emails

## Project Structure
- config/: database, file upload, and S3 helpers
- controllers/: request handlers for each resource
- middleWares/: auth/role middleware
- models/: Mongoose schemas
- routes/: REST endpoints grouped by domain
- utils/: shared helpers (tokens, email, etc.)
- index.js: app bootstrap and route wiring
- seedAdmin.js: admin seeding utility

## Request Flow
1. Route hits Express router in routes/.
2. Controller in controllers/ validates input, handles business logic.
3. Model in models/ reads/writes MongoDB.
4. Responses are returned with JSON payloads and status codes.

## Authentication
- JWT is issued on login and stored in cookies (token) and can also be passed via Authorization: Bearer.
- Middleware: `isLogin` in [backend/middleWares/isLogin.js](backend/middleWares/isLogin.js) verifies token and loads user across role collections.

## File Uploads
- Multer parses form data.
- S3 helpers in [backend/config/s3Config.js](backend/config/s3Config.js) handle upload and delete.

## Environment Variables
Create a .env file in backend/ with:
- PORT
- MONGODB_URI
- DB_URL (optional, used in db logging)
- JWT_TOKEN
- NODE_ENV
- AWS_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_BUCKET_NAME
- AWS_FOLDER_NAME (optional)
- EMAIL_HOST
- EMAIL_PORT
- EMAIL_USER
- EMAIL_PASS
- EMAIL_FROM
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- OPENAI_API_KEY (optional, if enabling AI blog features)

## Scripts
- dev: run the API server with nodemon

## Route Map (Base Paths)
These base paths are registered in [backend/index.js](backend/index.js):
- /v1/auth
- /v1/users
- /v1/blogs
- /v1/products
- /v1/categories
- /v1/ratings
- /v1/reviews
- /v1/orders
- /v1/leads
- /v1/addresses
- /v1/coupons
- /v1/settings
- /v1/notes
- /v1/sessions
- /v1/popups
- /v1/newsletters
- /v1/contact
- /v1/appointments
- /v1/patients
- /v1/prescriptions
- /v1/reports
- /v1/dashboard
- /v1/customer
- /v1/payment-methods
- /v1/razorpay
- /v1/influencer-referrals
- /v1/influencer-notes
- /v1/influencer-reports
- /v1/influencer-settings

## Full API Documentation
Detailed endpoint docs live here: [backend/API_DOCUMENTATION_UPDATED.md](backend/API_DOCUMENTATION_UPDATED.md)
