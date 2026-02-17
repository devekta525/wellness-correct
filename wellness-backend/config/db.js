
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()
const uri = process.env.DB_URL
const dbConnection = async () => {

    try {
        await mongoose.connect(process.env.MONGODB_URI)
    } catch (error) {
        throw new Error("data base not connected");

    }
}
export default dbConnection
