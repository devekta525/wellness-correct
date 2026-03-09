// Load environment variables as early as possible. the side‑effect import is
// evaluated before any other module in this file, so dotenv runs before
// `app.js` (which imports controllers that read process.env).
import 'dotenv/config';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Backwards compatibility: map legacy env names to canonical MONGO_URI
if (!process.env.MONGO_URI) {
  if (process.env.MONGODB_URI) process.env.MONGO_URI = process.env.MONGODB_URI;
  else if (process.env.DB_URL) process.env.MONGO_URI = process.env.DB_URL;
}

// quick env warnings
const requiredEnvs = ['MONGO_URI', 'JWT_TOKEN', 'NODE_ENV'];
requiredEnvs.forEach((name) => {
  if (!process.env[name]) console.warn(`⚠️  Environment variable ${name} is not set`);
});

import { connectDB } from './config/db.js';
import app from './app.js';

const port = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(port, () => console.log(`server listen on port: ${port}`));
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
