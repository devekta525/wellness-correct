
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || process.env.DB_URL;

if (!uri) {
  console.error("❌ MongoDB connection string (MONGODB_URI or DB_URL) is not defined.");
}

const dbConnection = async () => {
    try {
        await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        throw error;
    }
};
export default dbConnection;
