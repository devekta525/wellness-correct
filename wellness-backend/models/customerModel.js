import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
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
        patientId: {
            type: String,
            unique: true,
            index: true,
            sparse: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ["Customer"],
            default: "Customer",
        },
        password: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            default: "",
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        age: {
            type: Number,
        },
        bloodGroup: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
        },
        location: {
            type: String,
        },
        status: {
            type: String,
            enum: ["active", "inactive", "discharged", "emergency"],
            default: "active",
        },
        patientType: {
            type: String,
            enum: ["new", "regular", "vip", "emergency"],
            default: "new",
        },
        medicalHistory: [
            {
                type: String,
            },
        ],
        currentMedications: [
            {
                type: String,
            },
        ],
        allergies: [
            {
                type: String,
            },
        ],
        emergencyContact: {
            name: { type: String },
            phone: { type: String },
        },
        insuranceProvider: {
            type: String,
        },
        tags: [
            {
                type: String,
            },
        ],
        notes: {
            type: String,
        },
        address: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        zipCode: {
            type: Number,
        },
        walletBalance: {
            type: Number,
            default: 0,
        },
        referralCode: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        maritalStatus: {
            type: String,
            enum: ["Single", "Married", "Divorced", "Widowed"],
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        paymentMethods: [
            {
                cardType: { type: String, required: true },
                cardNumber: { type: String, required: true },
                cardHolderName: { type: String, required: true },
                expiryDate: { type: String, required: true },
                isDefault: { type: Boolean, default: false },
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            default: null,
        },
    },
    { timestamps: true }
);

import bcrypt from "bcrypt";

CustomerSchema.pre("validate", async function (next) {
    if (this.patientId) {
        return next();
    }
    try {
        const Customer = this.constructor;
        let patientId;
        let exists = true;
        while (exists) {
            const random = Math.floor(Math.random() * 1000000)
                .toString()
                .padStart(6, "0");
            patientId = `PI${random}`;
            exists = await Customer.exists({ patientId });
        }
        this.patientId = patientId;
        next();
    } catch (error) {
        next(error);
    }
});

CustomerSchema.pre("save", async function (next) {
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

const Customer = mongoose.model("Customer", CustomerSchema);

export default Customer;
