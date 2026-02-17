
import { Router } from 'express';
import {
  upsertSettings,
  getAllSettings,
  getSEOSetting,
  getBusinessSetting,
  getShippingSetting,
  updateSEOSetting,
  updateBusinessSetting,
  updateShippingSetting,
  updateSettings,
  deleteSettings,
  addShippingZone,
  removeShippingZone
} from '../controllers/settingController.js';

const router = Router();

// Complete settings CRUD
router.post('/', upsertSettings);           // Create/upsert all settings
router.get('/', getAllSettings);            // Get all settings
router.put('/', updateSettings);            // Update all settings
router.delete('/', deleteSettings);         // Delete all settings

// SEO settings
router.get('/seo', getSEOSetting);          // Get SEO settings only
router.put('/seo', updateSEOSetting);       // Update SEO settings

// Business settings
router.get('/business', getBusinessSetting);     // Get Business settings only
router.put('/business', updateBusinessSetting);  // Update Business settings

// Shipping settings
router.get('/shipping', getShippingSetting);     // Get Shipping settings only
router.put('/shipping', updateShippingSetting);  // Update Shipping settings

// Shipping zone management
router.post('/shipping/zones', addShippingZone);       // Add shipping zone
router.delete('/shipping/zones/:zoneId', removeShippingZone); // Remove zone

export default router;
