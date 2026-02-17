import { model, Schema } from "mongoose";

const appointmentSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientName: {
    type: String,
    required: true,
    trim: true,
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Ref 'User' hi rahega, kyunki doctors User collection mein hain
    required: true,
  },
  appointmentDate: { // `date` ko `appointmentDate` kiya taaki confusion na ho
    type: Date,
    required: true,
  },
  appointmentTime: { // `time` ko `appointmentTime` kiya
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 30, // Default 30 minutes
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'checkup'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], // 'canceled' ko 'cancelled' kiya as per frontend
    default: 'pending',
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  location: { // Frontend mein hai (e.g., 'Room 101')
    type: String,
  },
  fee: {
    type: Number,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Indexing for better query performance for a doctor's appointments
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });

const Appointment = model("Appointment", appointmentSchema);

export default Appointment;