const crypto = require('crypto');

module.exports = {
  id: 'payu',
  displayName: 'PayU',
  description: 'Accept Cards, UPI, EMI via PayU Payment Gateway',
  fields: [
    { key: 'merchant_key', label: 'Merchant Key', type: 'text', placeholder: 'Your PayU Merchant Key', required: true },
    { key: 'merchant_salt', label: 'Merchant Salt', type: 'password', placeholder: 'Your PayU Merchant Salt', required: true },
  ],

  getPublicConfig(config) {
    return {
      merchant_key: config.merchant_key,
      action_url: config.mode === 'live'
        ? 'https://secure.payu.in/_payment'
        : 'https://test.payu.in/_payment',
    };
  },

  // PayU uses a form-redirect model – we generate the signed payload server-side
  async createOrder({ amount, orderId, currency = 'INR', config, customerInfo = {} }) {
    if (!config.merchant_key || !config.merchant_salt) throw new Error('PayU keys not configured');
    const txnId = `Wellness_fuel_${orderId}_${Date.now()}`;
    const productInfo = 'Wellness_fuel Order';
    const firstName = customerInfo.name?.split(' ')[0] || 'Customer';
    const email = customerInfo.email || 'customer@Wellness_fuel.com';

    // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
    const hashString = `${config.merchant_key}|${txnId}|${amount}|${productInfo}|${firstName}|${email}|||||||||||${config.merchant_salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    return {
      merchant_key: config.merchant_key,
      txn_id: txnId,
      amount: String(amount),
      product_info: productInfo,
      first_name: firstName,
      email,
      hash,
      action_url: config.mode === 'live'
        ? 'https://secure.payu.in/_payment'
        : 'https://test.payu.in/_payment',
    };
  },

  verifyPayment({ txnid, amount, productinfo, firstname, email, status, hash: receivedHash, mihpayid }, config) {
    if (!config.merchant_salt) throw new Error('PayU salt not configured');
    // Reverse hash: sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    const reverseHashStr = `${config.merchant_salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${config.merchant_key}`;
    const expected = crypto.createHash('sha512').update(reverseHashStr).digest('hex');
    if (expected !== receivedHash) throw new Error('PayU payment verification failed');
    if (status !== 'success') throw new Error(`Payment failed: ${status}`);
    return { paymentId: mihpayid, verified: true };
  },

  async testConnection(config) {
    if (!config.merchant_key || !config.merchant_salt) throw new Error('PayU keys not configured');
    // PayU doesn't have a simple ping endpoint; just validate key format
    if (config.merchant_key.length < 5) throw new Error('Invalid PayU merchant key');
    return { success: true, message: 'PayU credentials look valid (cannot fully test without a transaction)' };
  },
};
