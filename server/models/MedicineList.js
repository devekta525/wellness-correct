const mongoose = require('mongoose');

const medicineListSchema = new mongoose.Schema(
  {
    externalId: { type: String, required: true, unique: true }, // from JSON "id"
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    isDiscontinued: { type: Boolean, default: false },
    manufacturerName: { type: String, trim: true },
    type: { type: String, trim: true, default: 'allopathy' },
    packSizeLabel: { type: String, trim: true },
    shortComposition1: { type: String, trim: true },
    shortComposition2: { type: String, trim: true },
  },
  { timestamps: true }
);

medicineListSchema.index({ name: 'text', manufacturerName: 'text', shortComposition1: 'text' });
medicineListSchema.index({ type: 1 });
medicineListSchema.index({ manufacturerName: 1 });
medicineListSchema.index({ isDiscontinued: 1 });

module.exports = mongoose.model('MedicineList', medicineListSchema, 'medicinelists');
