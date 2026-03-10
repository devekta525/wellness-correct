const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  startTime: { type: String, default: '09:00' }, // "HH:MM"
  endTime: { type: String, default: '17:00' },
  isAvailable: { type: Boolean, default: true },
}, { _id: false });

const doctorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, required: true, trim: true },
  qualifications: [String],
  experience: { type: Number, default: 0 }, // years
  bio: { type: String, trim: true },
  languages: { type: [String], default: ['English', 'Hindi'] },
  consultationFee: { type: Number, required: true, min: 0 },
  consultationDuration: { type: Number, default: 30 }, // minutes
  profileImage: { type: String, default: '' },
  availability: { type: [availabilitySchema], default: [] },
  gmeetLink: { type: String, trim: true }, // Doctor's permanent Online link
  registrationNumber: { type: String, trim: true },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  totalConsultations: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  adminNotes: { type: String },
}, { timestamps: true });

doctorProfileSchema.index({ specialization: 1 });
doctorProfileSchema.index({ isApproved: 1, isActive: 1 });
doctorProfileSchema.index({ 'rating.average': -1 });

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
