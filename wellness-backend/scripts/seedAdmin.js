import '../scripts/bootstrap.js';
import bcrypt from 'bcrypt';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/userModel.js';

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@wellness.com';
        const adminPassword = 'admin@123';
        const adminPhone = '0000000000';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists.');
        } else {
            const newAdmin = new User({
                firstName: 'Admin',
                lastName: 'User',
                email: adminEmail,
                password: adminPassword,
                phone: adminPhone,
                role: 'Admin',
                dateOfBirth: new Date('1990-01-01'),
                status: 'active'
            });

            await newAdmin.save();
            console.log('Admin user created successfully.');
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
        }

        await disconnectDB();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
