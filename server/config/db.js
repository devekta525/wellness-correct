const mongoose = require('mongoose');

const RETRY_INTERVAL_MS = 10000; // 10 seconds

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error('Server will keep running. Add your IP to Atlas whitelist and connection will retry automatically.');
    // Retry in background so server stays up (e.g. after you whitelist IP in Atlas)
    setTimeout(connectDB, RETRY_INTERVAL_MS);
  }
};

module.exports = connectDB;
