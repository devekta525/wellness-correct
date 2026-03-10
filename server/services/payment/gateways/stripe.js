module.exports = {
  id: 'stripe',
  displayName: 'Stripe',
  description: 'Accept Credit/Debit Cards globally via Stripe',
  logo: 'https://stripe.com/favicon.ico',
  fields: [
    { key: 'publishable_key', label: 'Publishable Key', type: 'text', placeholder: 'pk_test_xxxxxxxxxxxx', required: true },
    { key: 'secret_key', label: 'Secret Key', type: 'password', placeholder: 'sk_test_xxxxxxxxxxxx', required: true },
    { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', placeholder: 'whsec_xxxxxxxxxxxx', required: false },
  ],

  getPublicConfig(config) {
    return { publishable_key: config.publishable_key };
  },

  async createOrder({ amount, orderId, currency = 'INR', config }) {
    if (!config.secret_key || !config.secret_key.startsWith('sk_')) throw new Error('Stripe secret key not configured');
    const stripe = require('stripe')(config.secret_key);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata: { orderId: String(orderId) },
    });
    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id };
  },

  async verifyPayment({ payment_intent_id }, config) {
    if (!config.secret_key) throw new Error('Stripe not configured');
    const stripe = require('stripe')(config.secret_key);
    const intent = await stripe.paymentIntents.retrieve(payment_intent_id);
    if (intent.status !== 'succeeded') throw new Error(`Payment not completed: ${intent.status}`);
    return { paymentId: intent.id, verified: true };
  },

  async testConnection(config) {
    if (!config.secret_key || !config.secret_key.startsWith('sk_')) throw new Error('Invalid Stripe secret key');
    const stripe = require('stripe')(config.secret_key);
    await stripe.balance.retrieve();
    return { success: true, message: 'Stripe connected successfully' };
  },
};
