import dotenv from 'dotenv';

// Load environment variables for standalone scripts (only once per process)
dotenv.config();

// Normalize legacy env names to canonical MONGO_URI
if (!process.env.MONGO_URI) {
    if (process.env.MONGODB_URI) process.env.MONGO_URI = process.env.MONGODB_URI;
    else if (process.env.DB_URL) process.env.MONGO_URI = process.env.DB_URL;
}

export default null;
