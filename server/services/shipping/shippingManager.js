const Settings = require('../../models/Settings');

const PROVIDERS = {
  shiprocket: require('./providers/shiprocket'),
  delhivery: require('./providers/delhivery'),
  bluedart: require('./providers/bluedart'),
};

const SETTING_KEY = (id) => `gateway_shipping_${id}`;

const loadProviderConfig = async (providerId) => {
  const data = await Settings.get(SETTING_KEY(providerId));
  return data || { enabled: false, mode: 'test', config: {} };
};

const saveProviderConfig = async (providerId, data) => {
  await Settings.set(SETTING_KEY(providerId), data, 'gateways');
};

const getAllProviders = async () => {
  const result = [];
  for (const [id, p] of Object.entries(PROVIDERS)) {
    const stored = await loadProviderConfig(id);
    result.push({
      id,
      displayName: p.displayName,
      description: p.description,
      fields: p.fields,
      enabled: stored.enabled || false,
      mode: stored.mode || 'test',
      config: stored.config || {},
    });
  }
  return result;
};

const getActiveProvider = async () => {
  for (const [id, p] of Object.entries(PROVIDERS)) {
    const stored = await loadProviderConfig(id);
    if (stored.enabled) return { id, provider: p, config: { ...stored.config, mode: stored.mode } };
  }
  // Fallback: auto-enable shiprocket if env vars are configured
  if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD) {
    const p = PROVIDERS.shiprocket;
    return { id: 'shiprocket', provider: p, config: {} }; // resolveConfig will use env vars
  }
  return null;
};

const getRates = async (params) => {
  const active = await getActiveProvider();
  if (!active) throw new Error('No shipping provider is enabled');
  return active.provider.getRates(params, active.config);
};

const createShipment = async (orderData) => {
  const active = await getActiveProvider();
  if (!active) throw new Error('No shipping provider is enabled');
  return active.provider.createShipment(orderData, active.config);
};

const trackShipment = async (trackingId) => {
  const active = await getActiveProvider();
  if (!active) throw new Error('No shipping provider is enabled');
  const method = active.provider.trackShipment;
  return method(trackingId, active.config);
};

/**
 * Test provider connection. Pass override to test with current form values (e.g. before save).
 */
const testConnection = async (providerId, override = {}) => {
  const p = PROVIDERS[providerId];
  if (!p) throw new Error(`Unknown shipping provider: ${providerId}`);
  const stored = await loadProviderConfig(providerId);
  const mode = override.mode != null ? override.mode : stored.mode;
  const config = { ...stored.config, ...(override.config || {}), mode };
  return p.testConnection(config);
};

module.exports = { getAllProviders, getActiveProvider, getRates, createShipment, trackShipment, testConnection, loadProviderConfig, saveProviderConfig, PROVIDERS };
