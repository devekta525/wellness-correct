const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  group: { type: String, default: 'general' },
  isPublic: { type: Boolean, default: false },
  label: String,
  type: { type: String, enum: ['string', 'number', 'boolean', 'json', 'array'], default: 'string' },
}, { timestamps: true });

settingsSchema.index({ group: 1 });

const Settings = mongoose.model('Settings', settingsSchema);

// Helper to get/set settings easily
Settings.get = async (key, defaultValue = null) => {
  const setting = await Settings.findOne({ key });
  return setting ? setting.value : defaultValue;
};

Settings.set = async (key, value, group = 'general') => {
  await Settings.findOneAndUpdate(
    { key },
    { key, value, group },
    { upsert: true, new: true }
  );
};

module.exports = Settings;
