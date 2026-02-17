import mongoose from "mongoose";
import bcrypt from "bcrypt";

const InfluencerSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["Influencer"],
            default: "Influencer",
        },
        password: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            default: "",
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        // Profile Fields
        platform: {
            type: String,
        },
        followers: {
            type: Number,
        },
        engagementRate: {
            type: Number,
        },
        category: {
            type: String,
        },
        location: {
            type: String,
        },
        notes: {
            type: String,
        },
        language: [
            {
                type: String,
            },
        ],
        collaborationRate: {
            type: Number,
        },
        sponsoredPostRate: {
            type: Number,
        },

        // Business Fields
        brandName: {
            type: String,
        },
        businessAddress: {
            type: String,
        },
        businessPhone: {
            type: String,
        },
        businessEmail: {
            type: String,
        },
        website: {
            type: String,
        },
        taxId: {
            type: String,
        },
        businessType: {
            type: String,
        },
        socialMediaLinks: {
            type: String,
        },
        averagePostTime: {
            type: Number,
        },
        maxCollaborationsPerMonth: {
            type: Number,
        },
        brandPartnerships: {
            type: Boolean,
            default: true,
        },

        // Security Fields
        occupation: {
            type: String,
        },
        walletBalance: {
            type: Number,
            default: 0,
        },
        commissionRate: {
            type: Number,
            default: 10,
        },
        referralCode: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        loginAlerts: {
            type: Boolean,
            default: false,
        },
        sessionTimeout: {
            type: Number,
            default: 30,
        },
        passwordExpiry: {
            type: Number,
            default: 90,
        },
        ipWhitelist: [
            {
                type: String,
            },
        ],
        auditLogs: {
            type: Boolean,
            default: true,
        },
        dataEncryption: {
            type: Boolean,
            default: true,
        },
        backupFrequency: {
            type: String,
            default: "daily",
        },
    },
    { timestamps: true }
);

InfluencerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

const Influencer = mongoose.model("Influencer", InfluencerSchema);

export default Influencer;
