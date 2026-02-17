/**
 * Migration Script: Consolidate separate user collections into unified User collection
 * 
 * This script migrates data from Admin, Doctor, Influencer, and Customer collections
 * into a single unified User collection with role-based differentiation.
 * 
 * IMPORTANT: 
 * - Backup your database before running this migration
 * - Run this script ONCE after deploying the new unified model
 * - This script preserves all existing data and relationships
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import old models (these will be removed after migration)
import Admin from './models/adminModel.js';
import Doctor from './models/doctorModel.js';
import Influencer from './models/influencerModel.js';
import Customer from './models/customerModel.js';

// Import new unified model
import User from './models/userModel.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wellness';

const migrateUsers = async () => {
    try {
        console.log('🚀 Starting user migration...\n');

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        let totalMigrated = 0;
        let errors = [];

        // Check if users collection already has data
        const existingUsersCount = await User.countDocuments();
        if (existingUsersCount > 0) {
            console.log(`⚠️  Warning: Users collection already has ${existingUsersCount} documents.`);
            console.log('   This script will skip duplicate emails/phones.\n');
        }

        // Migrate Admins
        console.log('📋 Migrating Admins...');
        try {
            const admins = await Admin.find().lean();
            console.log(`   Found ${admins.length} admins`);

            for (const admin of admins) {
                try {
                    const existingUser = await User.findOne({ email: admin.email });
                    if (existingUser) {
                        console.log(`   ⚠️  Skipped: Admin ${admin.email} (already exists in User collection)`);
                        continue;
                    }

                    const userData = {
                        ...admin,
                        _id: admin._id,
                        role: 'Admin',
                        adminRole: admin.role || 'admin',
                        permissions: admin.permissions || [],
                    };

                    // Remove admin-specific role field to avoid conflict
                    delete userData.role;
                    userData.role = 'Admin';

                    await User.create(userData);
                    totalMigrated++;
                    console.log(`   ✅ Migrated admin: ${admin.email}`);
                } catch (error) {
                    errors.push({ type: 'Admin', email: admin.email, error: error.message });
                    console.log(`   ❌ Error migrating admin ${admin.email}: ${error.message}`);
                }
            }
        } catch (error) {
            console.log(`   ⚠️  No Admin collection found or error: ${error.message}`);
        }

        // Migrate Doctors
        console.log('\n📋 Migrating Doctors...');
        try {
            const doctors = await Doctor.find().lean();
            console.log(`   Found ${doctors.length} doctors`);

            for (const doctor of doctors) {
                try {
                    const existingUser = await User.findOne({ email: doctor.email });
                    if (existingUser) {
                        console.log(`   ⚠️  Skipped: Doctor ${doctor.email} (already exists in User collection)`);
                        continue;
                    }

                    const userData = {
                        ...doctor,
                        _id: doctor._id,
                        role: 'Doctor',
                    };

                    await User.create(userData);
                    totalMigrated++;
                    console.log(`   ✅ Migrated doctor: ${doctor.email}`);
                } catch (error) {
                    errors.push({ type: 'Doctor', email: doctor.email, error: error.message });
                    console.log(`   ❌ Error migrating doctor ${doctor.email}: ${error.message}`);
                }
            }
        } catch (error) {
            console.log(`   ⚠️  No Doctor collection found or error: ${error.message}`);
        }

        // Migrate Influencers
        console.log('\n📋 Migrating Influencers...');
        try {
            const influencers = await Influencer.find().lean();
            console.log(`   Found ${influencers.length} influencers`);

            for (const influencer of influencers) {
                try {
                    const existingUser = await User.findOne({ email: influencer.email });
                    if (existingUser) {
                        console.log(`   ⚠️  Skipped: Influencer ${influencer.email} (already exists in User collection)`);
                        continue;
                    }

                    const userData = {
                        ...influencer,
                        _id: influencer._id,
                        role: 'Influencer',
                    };

                    await User.create(userData);
                    totalMigrated++;
                    console.log(`   ✅ Migrated influencer: ${influencer.email}`);
                } catch (error) {
                    errors.push({ type: 'Influencer', email: influencer.email, error: error.message });
                    console.log(`   ❌ Error migrating influencer ${influencer.email}: ${error.message}`);
                }
            }
        } catch (error) {
            console.log(`   ⚠️  No Influencer collection found or error: ${error.message}`);
        }

        // Migrate Customers
        console.log('\n📋 Migrating Customers...');
        try {
            const customers = await Customer.find().lean();
            console.log(`   Found ${customers.length} customers`);

            for (const customer of customers) {
                try {
                    const existingUser = await User.findOne({ email: customer.email });
                    if (existingUser) {
                        console.log(`   ⚠️  Skipped: Customer ${customer.email} (already exists in User collection)`);
                        continue;
                    }

                    const userData = {
                        ...customer,
                        _id: customer._id,
                        role: 'Customer',
                    };

                    await User.create(userData);
                    totalMigrated++;
                    console.log(`   ✅ Migrated customer: ${customer.email}`);
                } catch (error) {
                    errors.push({ type: 'Customer', email: customer.email, error: error.message });
                    console.log(`   ❌ Error migrating customer ${customer.email}: ${error.message}`);
                }
            }
        } catch (error) {
            console.log(`   ⚠️  No Customer collection found or error: ${error.message}`);
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Total users migrated: ${totalMigrated}`);
        console.log(`❌ Total errors: ${errors.length}`);

        if (errors.length > 0) {
            console.log('\n⚠️  Errors encountered:');
            errors.forEach(err => {
                console.log(`   - ${err.type}: ${err.email} - ${err.error}`);
            });
        }

        const finalUserCount = await User.countDocuments();
        console.log(`\n📈 Total users in unified collection: ${finalUserCount}`);

        console.log('\n✅ Migration completed!');
        console.log('\n⚠️  NEXT STEPS:');
        console.log('   1. Verify the User collection has all expected data');
        console.log('   2. Test login/signup with different user roles');
        console.log('   3. Once verified, you can optionally drop old collections:');
        console.log('      - db.admins.drop()');
        console.log('      - db.doctors.drop()');
        console.log('      - db.influencers.drop()');
        console.log('      - db.customers.drop()');
        console.log('   4. Update your application to use the unified User model\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Run migration
migrateUsers()
    .then(() => {
        console.log('✨ Migration script finished');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
