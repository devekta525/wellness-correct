import jwt from "jsonwebtoken";
import dotenv from  "dotenv";

// load environment variables once when this module is required
// (index.js already calls dotenv.config(), so this is mostly defensive)
dotenv.config();

if (!process.env.JWT_TOKEN) {
  console.warn("⚠️  JWT_TOKEN is not defined in environment variables. Token generation will fail.");
}

export default function generateToken(id) {
    // id should usually be a string or ObjectId
    return jwt.sign({ id }, process.env.JWT_TOKEN, { expiresIn: "1d" });
}