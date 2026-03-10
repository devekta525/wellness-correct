const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');
const { uploadMemory, uploadToCloudinary } = require('../config/cloudinary');

const KEYS = {
  banners: 'site_banners',
  logo: 'site_logo',
  logoDark: 'site_logo_dark',
  favicon: 'site_favicon',
  social: 'site_social',
  contact: 'site_contact',
};

const DEFAULTS = {
  [KEYS.banners]: [],
  [KEYS.logo]: '',
  [KEYS.logoDark]: '',
  [KEYS.favicon]: '',
  [KEYS.social]: {},
  [KEYS.contact]: {},
};

// @desc    Get public site customization + platform settings (for homepage, footer, checkout – no auth)
// @route   GET /api/site
const getPublicCustomization = asyncHandler(async (req, res) => {
  const [banners, logo, logoDark, favicon, social, contact, siteName, siteTagline, currency, currencySymbol, freeShippingThreshold, standardShippingCost, taxRate] = await Promise.all([
    Settings.get(KEYS.banners, DEFAULTS[KEYS.banners]),
    Settings.get(KEYS.logo, DEFAULTS[KEYS.logo]),
    Settings.get(KEYS.logoDark, DEFAULTS[KEYS.logoDark]),
    Settings.get(KEYS.favicon, DEFAULTS[KEYS.favicon]),
    Settings.get(KEYS.social, DEFAULTS[KEYS.social]),
    Settings.get(KEYS.contact, DEFAULTS[KEYS.contact]),
    Settings.get('site_name', 'Wellness_fuel'),
    Settings.get('site_tagline', ''),
    Settings.get('currency', 'INR'),
    Settings.get('currency_symbol', '₹'),
    Settings.get('free_shipping_threshold', 999),
    Settings.get('standard_shipping_cost', 49),
    Settings.get('tax_rate', 18),
  ]);
  res.json({
    success: true,
    site: {
      banners: Array.isArray(banners) ? banners : [],
      logo: logo || '',
      logoDark: logoDark || '',
      favicon: favicon || '',
      social: social && typeof social === 'object' ? social : {},
      contact: contact && typeof contact === 'object' ? contact : {},
      settings: {
        siteName: siteName || 'Wellness_fuel',
        siteTagline: siteTagline || '',
        currency: currency || 'INR',
        currencySymbol: currencySymbol || '₹',
        freeShippingThreshold: (v => { const n = Number(v); return (n === 0 || n) && !Number.isNaN(n) ? n : 999 })(freeShippingThreshold),
        standardShippingCost: (v => { const n = Number(v); return (n === 0 || n) && !Number.isNaN(n) ? n : 49 })(standardShippingCost),
        taxRate: (v => { const n = Number(v); return (n === 0 || n) && !Number.isNaN(n) ? n : 18 })(taxRate),
      },
    },
  });
});

// @desc    Get full customization (admin)
// @route   GET /api/admin/customization
const getCustomization = asyncHandler(async (req, res) => {
  const [banners, logo, logoDark, favicon, social, contact] = await Promise.all([
    Settings.get(KEYS.banners, DEFAULTS[KEYS.banners]),
    Settings.get(KEYS.logo, DEFAULTS[KEYS.logo]),
    Settings.get(KEYS.logoDark, DEFAULTS[KEYS.logoDark]),
    Settings.get(KEYS.favicon, DEFAULTS[KEYS.favicon]),
    Settings.get(KEYS.social, DEFAULTS[KEYS.social]),
    Settings.get(KEYS.contact, DEFAULTS[KEYS.contact]),
  ]);
  res.json({
    success: true,
    customization: {
      banners: Array.isArray(banners) ? banners : [],
      logo: logo || '',
      logoDark: logoDark || '',
      favicon: favicon || '',
      social: social && typeof social === 'object' ? social : {},
      contact: contact && typeof contact === 'object' ? contact : {},
    },
  });
});

// @desc    Update customization (admin) – partial update
// @route   PUT /api/admin/customization
const updateCustomization = asyncHandler(async (req, res) => {
  const { banners, logo, logoDark, favicon, social, contact } = req.body;
  if (banners !== undefined) await Settings.set(KEYS.banners, Array.isArray(banners) ? banners : [], 'site');
  if (logo !== undefined) await Settings.set(KEYS.logo, String(logo), 'site');
  if (logoDark !== undefined) await Settings.set(KEYS.logoDark, String(logoDark), 'site');
  if (favicon !== undefined) await Settings.set(KEYS.favicon, String(favicon), 'site');
  if (social !== undefined) await Settings.set(KEYS.social, social && typeof social === 'object' ? social : {}, 'site');
  if (contact !== undefined) await Settings.set(KEYS.contact, contact && typeof contact === 'object' ? contact : {}, 'site');
  res.json({ success: true, message: 'Customization updated' });
});

// @desc    Upload site asset (banner, logo, favicon) – admin
// @route   POST /api/admin/customization/upload
// Body: multipart with "file" and "type" (banner | logo | favicon | category)
const uploadSiteAsset = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.buffer) {
    res.status(400);
    throw new Error('File is required');
  }
  const type = (req.body && req.body.type) || 'banner';
  const folderMap = { banner: 'Wellness_fuel/site/banners', logo: 'Wellness_fuel/site/logo', logoDark: 'Wellness_fuel/site/logo', favicon: 'Wellness_fuel/site/favicon', category: 'Wellness_fuel/site/categories' };
  const folder = folderMap[type] || folderMap.banner;
  let result;
  try {
    result = await uploadToCloudinary(req.file.buffer, { folder, quality: 'auto' });
  } catch (err) {
    const msg = err.message || String(err);
    if (msg.includes('cloud_name') || msg.includes('disabled') || (err.http_code === 401)) {
      res.status(503);
      throw new Error('Image upload not configured. Set CLOUDINARY_* in .env.');
    }
    throw err;
  }
  res.json({ success: true, url: result.secure_url, publicId: result.public_id });
});

module.exports = { getPublicCustomization, getCustomization, updateCustomization, uploadSiteAsset };
