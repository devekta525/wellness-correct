const httpRequest = require('../../../utils/httpRequest');

module.exports = {
  id: 'cashfree',
  displayName: 'Cashfree',
  description: 'Accept UPI, Cards, Wallets via Cashfree Payments',
  fields: [
    { key: 'app_id', label: 'App ID', type: 'text', placeholder: 'Your Cashfree App ID', required: true },
    { key: 'secret_key', label: 'Secret Key', type: 'password', placeholder: 'Your Cashfree Secret Key', required: true },
  ],

  getPublicConfig(config) {
    return { app_id: config.app_id };
  },

  _baseUrl(config) {
    return config.mode === 'live'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';
  },

  async createOrder({ amount, orderId, currency = 'INR', config }) {
    if (!config.app_id || !config.secret_key) throw new Error('Cashfree keys not configured');
    const { data } = await httpRequest({
      url: `${this._baseUrl(config)}/orders`,
      method: 'POST',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': config.app_id,
        'x-client-secret': config.secret_key,
      },
      body: {
        order_id: `Wellness_fuel_${orderId}_${Date.now()}`,
        order_amount: amount,
        order_currency: currency,
        customer_details: { customer_id: `cust_${Date.now()}` },
      },
    });
    return { paymentSessionId: data.payment_session_id, cashfreeOrderId: data.cf_order_id };
  },

  async verifyPayment({ cashfree_order_id }, config) {
    if (!config.app_id || !config.secret_key) throw new Error('Cashfree not configured');
    const { data } = await httpRequest({
      url: `${this._baseUrl(config)}/orders/${cashfree_order_id}`,
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': config.app_id,
        'x-client-secret': config.secret_key,
      },
    });
    if (data.order_status !== 'PAID') throw new Error(`Payment not completed: ${data.order_status}`);
    return { paymentId: cashfree_order_id, verified: true };
  },

  async testConnection(config) {
    if (!config.app_id || !config.secret_key) throw new Error('Cashfree keys not configured');
    await httpRequest({
      url: `${this._baseUrl(config)}/orders?limit=1`,
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': config.app_id,
        'x-client-secret': config.secret_key,
      },
    });
    return { success: true, message: 'Cashfree connected successfully' };
  },
};
