
import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MongoDB connection string (MONGO_URI) is not defined.');
    process.exit(1);
  }

  try {
    // Let mongoose choose defaults for options; avoid deprecated flags
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
};

const disconnectDB = async () => mongoose.disconnect();

export { connectDB, disconnectDB };
