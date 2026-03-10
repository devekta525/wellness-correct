const crypto = require('crypto');
const httpRequest = require('../../../utils/httpRequest');

module.exports = {
  id: 'razorpay',
  displayName: 'Razorpay',
  description: 'Accept UPI, Cards, Wallets, Net Banking via Razorpay',
  logo: 'https://razorpay.com/favicon.ico',
  fields: [
    { key: 'key_id', label: 'Key ID', type: 'text', placeholder: 'rzp_test_xxxxxxxxxxxx', required: true },
    { key: 'key_secret', label: 'Key Secret', type: 'password', placeholder: 'Your Razorpay secret key', required: true },
  ],

  getPublicConfig(config) {
    return { key_id: config.key_id };
  },

  async createOrder({ amount, orderId, currency = 'INR', config }) {
    if (!config.key_id || !config.key_secret) throw new Error('Razorpay keys not configured');
    const auth = Buffer.from(`${config.key_id}:${config.key_secret}`).toString('base64');
    const { data } = await httpRequest({
      url: 'https://api.razorpay.com/v1/orders',
      method: 'POST',
      headers: { Authorization: `Basic ${auth}` },
      body: {
        amount: Math.round(amount * 100), // paise
        currency,
        receipt: `ord_${orderId}`,
        notes: { orderId: String(orderId) },
      },
    });
    // Return shape expected by frontend: id + key_id for Razorpay checkout popup
    return {
      id: data.id,
      razorpayOrderId: data.id,
      amount: data.amount,
      currency: data.currency,
      key_id: config.key_id,
    };
  },

  verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }, config) {
    if (!config.key_secret) throw new Error('Razorpay secret not configured');
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', config.key_secret).update(body).digest('hex');
    if (expected !== razorpay_signature) throw new Error('Payment verification failed: signature mismatch');
    return { paymentId: razorpay_payment_id, verified: true };
  },

  async testConnection(config) {
    if (!config.key_id || !config.key_secret) throw new Error('Keys not configured');
    const auth = Buffer.from(`${config.key_id}:${config.key_secret}`).toString('base64');
    await httpRequest({
      url: 'https://api.razorpay.com/v1/orders?count=1',
      headers: { Authorization: `Basic ${auth}` },
    });
    return { success: true, message: 'Razorpay connected successfully' };
  },
};
