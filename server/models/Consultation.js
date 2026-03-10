const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 30 }, // minutes
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  paymentMethod: { type: String, default: '' },
  paymentId: { type: String, default: '' },
  amount: { type: Number, required: true },
  meetingLink: { type: String, default: '' }, // copied from doctor's gmeetLink at booking time
  symptoms: { type: String, default: '' }, // patient's notes
  cancelReason: { type: String, default: '' },
  doctorNotes: { type: String, default: '' },
}, { timestamps: true });

consultationSchema.index({ patient: 1, scheduledAt: -1 });
consultationSchema.index({ doctor: 1, scheduledAt: -1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ scheduledAt: 1 });

module.exports = mongoose.model('Consultation', consultationSchema);
