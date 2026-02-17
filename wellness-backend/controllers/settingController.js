import Setting from "../models/settingModel.js";


// Create or upsert complete settings document (singleton)
export async function upsertSettings(req, res) {
  if(!req.body){
    return res.status(400).json({ success: false, message: 'Fields are required' });
  }
  try {
    const settings  = await Setting.create(req.body);
    if(!settings) {
      return res.status(400).json({ success: false, message: 'Failed to create settings' });
    }
    res.status(201).json({ success: true, data: settings });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Get all settings
export async function getAllSettings(req, res) {
  try {
    const settings = await Setting.findOne({});
    if(!settings) {
      const newSettings = await Setting.create({});
      return res.status(200).json({ success: true, data: newSettings });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Get SEO settings only
export async function getSEOSetting(req, res) {
  try {
    const settings = await Setting.findOne({}, { seoSetting: 1 });
    res.json({ success: true, data: settings?.seoSetting || [] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Get Business settings only
export async function getBusinessSetting(req, res) {
  try {
    const settings = await Setting.findOne({}, { businessSetting: 1 });
    res.json({ success: true, data: settings?.businessSetting || [] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Get Shipping settings only
export async function getShippingSetting(req, res) {
  try {
    const settings = await Setting.findOne({}, { shippingSetting: 1 });
    res.json({ success: true, data: settings?.shippingSetting || [] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Update SEO settings only
export async function updateSEOSetting(req, res) {
  try {
    const settings = await Setting.findOneAndUpdate(
      {},
      { $set: { seoSetting: req.body.seoSetting } },
      { new: true, runValidators: true, upsert: true }
    );
    res.json({ success: true, data: settings.seoSetting });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Update Business settings only
export async function updateBusinessSetting(req, res) {
  try {
    const settings = await Setting.findOneAndUpdate(
      {},
      { $set: { businessSetting: req.body.businessSetting } },
      { new: true, runValidators: true, upsert: true }
    );
    res.json({ success: true, data: settings.businessSetting });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Update Shipping settings only
export async function updateShippingSetting(req, res) {
  try {
    const settings = await Setting.findOneAndUpdate(
      {},
      { $set: { shippingSetting: req.body.shippingSetting } },
      { new: true, runValidators: true, upsert: true }
    );
    res.json({ success: true, data: settings.shippingSetting });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Update entire settings document
export async function updateSettings(req, res) {
  try {
    const settings = await Setting.findOneAndUpdate(
      {},
      req.body,
      { new: true, runValidators: true }
    );
    if (!settings) {
      return res.status(200).json({ success: true, message: 'Settings not found' });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Delete settings (rarely needed)
export async function deleteSettings(req, res) {
  try {
    const deleted = await Setting.findOneAndDelete({});
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }
    res.json({ success: true, message: 'Settings deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Add shipping zone to shipping settings
export async function addShippingZone(req, res) {
  try {
    const { zoneName, shippingRate, freeShippingThreshold } = req.body;
    const settings = await Setting.findOne({});
    
    if (!settings) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }

    if (!settings.shippingSetting || !settings.shippingSetting[0]) {
      settings.shippingSetting = [{ shippingZones: [] }];
    }

    settings.shippingSetting[0].shippingZones.push({
      zoneName,
      shippingRate,
      freeShippingThreshold
    });

    await settings.save();
    res.json({ success: true, data: settings.shippingSetting });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Remove shipping zone
export async function removeShippingZone(req, res) {
  try {
    const { zoneId } = req.params;
    const settings = await Setting.findOne({});
    
    if (!settings || !settings.shippingSetting?.[0]?.shippingZones) {
      return res.status(404).json({ success: false, message: 'Shipping zones not found' });
    }

    settings.shippingSetting[0].shippingZones = 
      settings.shippingSetting[0].shippingZones.filter(
        zone => zone._id.toString() !== zoneId
      );

    await settings.save();
    res.json({ success: true, data: settings.shippingSetting });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
