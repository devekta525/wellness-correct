
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/userModel.js"; // Adjust path as necessary
import dbConnection from "./config/db.js"; // Adjust path as necessary

dotenv.config();

const seedAdmin = async () => {
    try {
        await dbConnection();

        const adminEmail = "admin@wellness.com";
        const adminPassword = "admin@123";
        const adminPhone = "0000000000"; // Dummy phone for admin

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("Admin user already exists.");
            // Optional: Update password if needed
            // const salt = await bcrypt.genSalt(10);
            // const hashedPassword = await bcrypt.hash(adminPassword, salt);
            // existingAdmin.password = hashedPassword;
            // await existingAdmin.save();
            // console.log("Admin password updated.");
        } else {
            // Create new admin user
            // Note: The User model pre-save hook handles hashing, so we pass plain password if using create/save
            // However, usually seed scripts might bypass mongoose middleware if using insertMany, but create() triggers hooks.
            // Let's rely on the pre-save hook in User model.

            const newAdmin = new User({
                firstName: "Admin",
                lastName: "User",
                email: adminEmail,
                password: adminPassword, // Will be hashed by pre-save hook
                phone: adminPhone,
                role: "Admin",
                dateOfBirth: new Date("1990-01-01"), // Required field
                status: "active"
            });

            await newAdmin.save();
            console.log("Admin user created successfully.");
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
        }

        process.exit();
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();
