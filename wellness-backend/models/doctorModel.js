import mongoose from "mongoose";
import bcrypt from "bcrypt";

const DoctorSchema = new mongoose.Schema(
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
      enum: ["Doctor"],
      default: "Doctor",
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
    dateOfBirth: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    hospital: {
      type: String,
    },
    experience: {
      type: Number,
    },
    consultationFee: {
      type: Number,
    },
    specialization: {
      type: String,
    },
    qualifications: {
      type: String,
    },
    availability: {
      type: String,
    },
    language: [
      {
        type: String,
      },
    ],
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    // Profile fields
    licenseNumber: {
      type: String,
    },
    location: {
      type: String,
    },
    bio: {
      type: String,
    },
    emergencyFee: {
      type: Number,
    },
    // Business fields
    clinicName: {
      type: String,
    },
    clinicAddress: {
      type: String,
    },
    clinicPhone: {
      type: String,
    },
    clinicEmail: {
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
      default: "Private Practice",
    },
    operatingHours: {
      type: Object,
      default: {
        monday: { start: "09:00", end: "17:00", closed: false },
        tuesday: { start: "09:00", end: "17:00", closed: false },
        wednesday: { start: "09:00", end: "17:00", closed: false },
        thursday: { start: "09:00", end: "17:00", closed: false },
        friday: { start: "09:00", end: "17:00", closed: false },
        saturday: { start: "10:00", end: "14:00", closed: false },
        sunday: { start: "00:00", end: "00:00", closed: true },
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
      default: true,
    },
    // Security fields
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

DoctorSchema.pre("save", async function (next) {
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

const Doctor = mongoose.model("Doctor", DoctorSchema);

export default Doctor;
