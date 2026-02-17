import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["Admin", "Doctor", "Influencer", "Customer"],
      default: "Customer",
    },

    // Admin-specific fields
    adminRole: {
      type: String,
      enum: ["super_admin", "admin", "moderator"],
      required: function () {
        return this.role === "Admin";
      },
    },

    permissions: [{ type: String }],

    // Customer-specific fields
    patientId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    age: {
      type: Number,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

    commissionRate: {
      type: Number,
      default: 10,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "discharged", "emergency"],
      default: "active",
    },

    imageUrl: {
      type: String,
      default: "",
    },

    dateOfBirth: {
      type: Date,
      required: function () {
        return this.role === "Customer";
      },
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    location: String,

    patientType: {
      type: String,
      enum: ["new", "regular", "vip", "emergency"],
      default: "new",
    },

    medicalHistory: [{ type: String }],
    currentMedications: [{ type: String }],
    allergies: [{ type: String }],

    emergencyContact: {
      name: { type: String },
      phone: { type: String },
    },

    insuranceProvider: String,

    tags: [{ type: String }],

    notes: String,

    // Doctor-specific fields
    hospital: String,
    experience: Number,
    consultationFee: Number,
    specialization: String,
    qualifications: String,
    availability: String,
    licenseNumber: String,
    bio: String,
    emergencyFee: Number,

    // Clinic/Business fields (for Doctors/Influencers)
    clinicName: String,
    clinicAddress: String,
    clinicPhone: String,
    clinicEmail: String,
    brandName: String,
    businessAddress: String,
    businessPhone: String,
    businessEmail: String,
    website: String,
    taxId: String,
    businessType: String,

    operatingHours: {
      type: Object,
      default: function () {
        if (this.role === "Doctor") {
          return {
            monday: { start: "09:00", end: "17:00", closed: false },
            tuesday: { start: "09:00", end: "17:00", closed: false },
            wednesday: { start: "09:00", end: "17:00", closed: false },
            thursday: { start: "09:00", end: "17:00", closed: false },
            friday: { start: "09:00", end: "17:00", closed: false },
            saturday: { start: "10:00", end: "14:00", closed: false },
            sunday: { start: "00:00", end: "00:00", closed: true },
          };
        }
        return {};
      },
    },

    appointmentDuration: {
      type: Number,
      default: 30,
    },

    maxPatientsPerDay: {
      type: Number,
      default: 20,
    },

    emergencyAvailability: {
      type: Boolean,
      default: function () {
        return this.role === "Doctor";
      },
    },

    language: [{ type: String }],

    // Influencer-specific fields
    platform: String,
    followers: Number,
    engagementRate: Number,
    category: String,
    socialMediaLinks: String,
    collaborationRate: Number,
    sponsoredPostRate: Number,
    averagePostTime: Number,
    maxCollaborationsPerMonth: Number,
    brandPartnerships: {
      type: Boolean,
      default: true,
    },

    // Customer fields
    occupation: String,

    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed"],
    },

    // Security fields (for Admin/Doctor/Influencer)
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

    ipWhitelist: [{ type: String }],

    auditLogs: {
      type: Boolean,
      default: function () {
        return ["Admin", "Doctor", "Influencer"].includes(this.role);
      },
    },

    dataEncryption: {
      type: Boolean,
      default: function () {
        return ["Admin", "Doctor", "Influencer"].includes(this.role);
      },
    },

    backupFrequency: {
      type: String,
      default: "daily",
    },

    // ⚠️ WARNING: avoid storing real card numbers (PCI risk)
    paymentMethods: [
      {
        cardType: { type: String, required: true },
        cardNumber: { type: String, required: true },
        cardHolderName: { type: String, required: true },
        expiryDate: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],

    address: String,
    city: String,
    state: String,
    zipCode: Number,
  },
  { timestamps: true }
);

// Auto-generate patientId for Customers
UserSchema.pre("validate", async function (next) {
  if (this.role !== "Customer" || this.patientId) {
    return next();
  }
  try {
    const User = this.constructor;
    let patientId;
    let exists = true;
    while (exists) {
      const random = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0");
      patientId = `PI${random}`;
      exists = await User.exists({ patientId });
    }
    this.patientId = patientId;
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ password hashing middleware
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", UserSchema);
export default User;
