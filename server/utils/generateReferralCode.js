const ReferralCode = require('../models/ReferralCode');

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const generateCode = (length = 8) => {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return code;
};

const generateUniqueCode = async (prefix = '', length = 8, maxAttempts = 10) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = prefix ? `${prefix.toUpperCase()}${generateCode(length)}` : generateCode(length);
    const exists = await ReferralCode.findOne({ code });
    if (!exists) return code;
  }
  throw new Error('Failed to generate unique referral code after multiple attempts');
};

const validateCustomCode = async (code) => {
  const cleaned = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length < 4 || cleaned.length > 20) {
    throw new Error('Code must be 4-20 alphanumeric characters');
  }
  const exists = await ReferralCode.findOne({ code: cleaned });
  if (exists) throw new Error('Code already exists, please choose another');
  return cleaned;
};

module.exports = { generateCode, generateUniqueCode, validateCustomCode };
