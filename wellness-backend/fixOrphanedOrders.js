import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

const fixOrphanedOrders = async () => {
    try {
        console.log('🔧 Fixing orphaned orders...\n');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const orphanedUserId = '65a1234567890abcdef12345';

        // Check if Guest User already exists
        const existingGuest = await User.findById(orphanedUserId);

        if (existingGuest) {
            console.log('✅ Guest user already exists');
        } else {
            // Create Guest User with the specific ObjectId
            const guestUser = new User({
                _id: new mongoose.Types.ObjectId(orphanedUserId),
                firstName: 'Guest',
                lastName: 'User',
                email: 'guest@wellness-system.local',
                phone: '0000000000',
                password: 'guest-account-no-login',
                role: 'Customer',
                isVerified: false,
                patientId: 'GUEST001',
                dateOfBirth: new Date('1990-01-01'),
                gender: 'Other'
            });

            await guestUser.save();
            console.log('✅ Created Guest User with ID:', orphanedUserId);
        }

        // Verify orders can now populate
        const db = mongoose.connection.db;
        const orderCount = await db.collection('orders').countDocuments({
            user: new mongoose.Types.ObjectId(orphanedUserId)
        });

        console.log(`\n📊 ${orderCount} orders now linked to Guest User`);
        console.log('✅ Orphaned orders fixed!\n');

        await mongoose.disconnect();
        console.log('🔌 Database connection closed');

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

fixOrphanedOrders();
