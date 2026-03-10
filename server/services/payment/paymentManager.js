const Settings = require('../../models/Settings');

const GATEWAYS = {
  razorpay: require('./gateways/razorpay'),
  stripe: require('./gateways/stripe'),
  cashfree: require('./gateways/cashfree'),
  payu: require('./gateways/payu'),
};

const SETTING_KEY = (id) => `gateway_payment_${id}`;

/**
 * Load a gateway's config from DB.
 * Returns { enabled, mode, config: { ...keys } } or null.
 */
const loadGatewayConfig = async (gatewayId) => {
  const data = await Settings.get(SETTING_KEY(gatewayId));
  return data || { enabled: false, mode: 'test', config: {} };
};

/**
 * Save a gateway's config to DB.
 */
const saveGatewayConfig = async (gatewayId, data) => {
  await Settings.set(SETTING_KEY(gatewayId), data, 'gateways');
};

/**
 * Returns list of all gateways with metadata + enabled/mode status (no secrets).
 */
const getAllGateways = async () => {
  const result = [];
  for (const [id, gw] of Object.entries(GATEWAYS)) {
    const stored = await loadGatewayConfig(id);
    result.push({
      id,
      displayName: gw.displayName,
      description: gw.description,
      fields: gw.fields,
      enabled: stored.enabled || false,
      mode: stored.mode || 'test',
      config: stored.config || {},
    });
  }
  return result;
};

/**
 * Returns active gateways with only the public config (no secrets).
 */
const getActiveGateways = async () => {
  const result = [];
  for (const [id, gw] of Object.entries(GATEWAYS)) {
    const stored = await loadGatewayConfig(id);
    if (!stored.enabled) continue;
    const publicConfig = gw.getPublicConfig({ ...stored.config, mode: stored.mode });
    result.push({
      id,
      displayName: gw.displayName,
      description: gw.description,
      mode: stored.mode || 'test',
      ...publicConfig,
    });
  }
  return result;
};

/**
 * Create a payment order via a specific gateway.
 */
const createOrder = async (gatewayId, params) => {
  const gw = GATEWAYS[gatewayId];
  if (!gw) throw new Error(`Unknown payment gateway: ${gatewayId}`);
  const stored = await loadGatewayConfig(gatewayId);
  if (!stored.enabled) throw new Error(`Gateway ${gatewayId} is not enabled`);
  const config = { ...stored.config, mode: stored.mode };
  return gw.createOrder({ ...params, config });
};

/**
 * Verify a payment via a specific gateway.
 */
const verifyPayment = async (gatewayId, payload) => {
  const gw = GATEWAYS[gatewayId];
  if (!gw) throw new Error(`Unknown payment gateway: ${gatewayId}`);
  const stored = await loadGatewayConfig(gatewayId);
  const config = { ...stored.config, mode: stored.mode };
  return gw.verifyPayment(payload, config);
};

/**
 * Test a gateway connection. Uses saved config by default; pass override to test with current form values (e.g. before save).
 * @param {string} gatewayId
 * @param {{ config?: object, mode?: string }} override - optional config/mode from request (e.g. unsaved form data)
 */
const testConnection = async (gatewayId, override = {}) => {
  const gw = GATEWAYS[gatewayId];
  if (!gw) throw new Error(`Unknown payment gateway: ${gatewayId}`);
  const stored = await loadGatewayConfig(gatewayId);
  const mode = override.mode != null ? override.mode : stored.mode;
  const config = { ...stored.config, ...(override.config || {}), mode };
  return gw.testConnection(config);
};

module.exports = { getAllGateways, getActiveGateways, createOrder, verifyPayment, testConnection, loadGatewayConfig, saveGatewayConfig, GATEWAYS };
