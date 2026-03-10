const mongoose = require('mongoose');

const rxMedicineSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicineList' },
  medicineName: { type: String, required: true },
  packSizeLabel: String,
  dosage: { type: String, default: '' },       // "1 tablet"
  frequency: { type: String, default: '' },    // "Twice daily"
  duration: { type: String, default: '' },     // "7 days"
  instructions: { type: String, default: '' }, // "After meals"
}, { _id: false });

const rxProductSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  thumbnail: String,
  dosage: { type: String, default: '' },
  frequency: { type: String, default: '' },
  duration: { type: String, default: '' },
  instructions: { type: String, default: '' },
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosis: { type: String, default: '' },
  medicines: [rxMedicineSchema],
  products: [rxProductSchema],
  notes: { type: String, default: '' },       // general doctor notes
  followUpDate: { type: Date },
  issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });

prescriptionSchema.index({ patient: 1, issuedAt: -1 });
prescriptionSchema.index({ consultation: 1 });
prescriptionSchema.index({ doctor: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
