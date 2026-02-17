import { model, Schema } from 'mongoose';

const PrescriptionMedicationSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    timing: { type: String },
    instructions: { type: String },
    quantity: { type: Number, required: true }
}, { _id: false });

const PrescriptionSchema = new Schema({
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patientName: {
        type: String,
        required: true,
        trim: true
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    prescriptionDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    diagnosis: {
        type: String,
        required: true
    },
    symptoms: {
        type: String
    },
    medications: [PrescriptionMedicationSchema],
    generalInstructions: {
        type: String
    },
    followUpDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    }
}, { timestamps: true });

PrescriptionSchema.index({ doctor: 1, patient: 1, prescriptionDate: -1 });

const Prescription = model('Prescription', PrescriptionSchema);

export default Prescription;