const httpRequest = require('../../../utils/httpRequest');

// Token cache: { token, expiresAt }
let _tokenCache = {};

const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

const getToken = async (config) => {
  const cacheKey = config.email;
  const cached = _tokenCache[cacheKey];
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const res = await httpRequest({
    url: `${BASE_URL}/auth/login`,
    method: 'POST',
    body: { email: config.email, password: config.password },
  });
  const token = res.data.token;
  _tokenCache[cacheKey] = { token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 }; // 9 days
  return token;
};

const authHeaders = async (config) => ({
  Authorization: `Bearer ${await getToken(config)}`,
});

module.exports = {
  id: 'shiprocket',
  displayName: 'Shiprocket',
  description: 'India\'s largest shipping aggregator — Bluedart, Delhivery, DTDC and more',
  fields: [
    { key: 'email', label: 'Shiprocket Email', type: 'text', placeholder: 'your@email.com', required: true },
    { key: 'password', label: 'Shiprocket Password', type: 'password', placeholder: 'Your password', required: true },
    { key: 'pickup_location', label: 'Pickup Location', type: 'text', placeholder: 'Primary', required: false },
  ],

  resolveConfig(config = {}) {
    return {
      email: config.email || process.env.SHIPROCKET_EMAIL,
      password: config.password || process.env.SHIPROCKET_PASSWORD,
      pickup_location: config.pickup_location || process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    };
  },

  async checkServiceability({ pickupPincode, deliveryPincode, weight, cod = 0 }, config) {
    config = this.resolveConfig(config);
    const headers = await authHeaders(config);
    const res = await httpRequest({
      url: `${BASE_URL}/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${cod}`,
      headers,
    });
    return res.data;
  },

  async getRates({ pickupPincode, deliveryPincode, weight, declaredValue, cod = 0 }, config) {
    config = this.resolveConfig(config);
    const headers = await authHeaders(config);
    const res = await httpRequest({
      url: `${BASE_URL}/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${cod}&declared_value=${declaredValue}`,
      headers,
    });
    const couriers = res.data?.data?.available_courier_companies || [];
    return couriers.map(c => ({
      courierId: c.courier_company_id,
      name: c.courier_name,
      estimatedDays: c.estimated_delivery_days,
      freight: c.freight_charge,
      cod: c.cod_charges,
      rating: c.rating,
    }));
  },

  async createShipment(orderData, config) {
    config = this.resolveConfig(config);
    const headers = await authHeaders(config);
    const res = await httpRequest({
      url: `${BASE_URL}/orders/create/adhoc`,
      method: 'POST',
      headers,
      body: {
        order_id: orderData.orderId,
        order_date: new Date().toISOString().split('T')[0],
        pickup_location: config.pickup_location || 'Primary',
        billing_customer_name: orderData.customerName,
        billing_last_name: '',
        billing_address: orderData.address.street,
        billing_city: orderData.address.city,
        billing_pincode: orderData.address.pincode,
        billing_state: orderData.address.state,
        billing_country: 'India',
        billing_email: orderData.customerEmail || '',
        billing_phone: orderData.address.phone,
        shipping_is_billing: 1,
        order_items: orderData.items.map(i => ({
          name: i.title,
          sku: i.sku || i.title.slice(0, 20),
          units: i.quantity,
          selling_price: i.price,
        })),
        payment_method: orderData.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
        sub_total: orderData.total,
        length: orderData.length || 10,
        breadth: orderData.breadth || 10,
        height: orderData.height || 10,
        weight: orderData.weight || 0.5,
      },
    });
    return {
      shipmentId: res.data.shipment_id,
      orderId: res.data.order_id,
      awbCode: res.data.awb_code,
      courierName: res.data.courier_name,
      status: res.data.status,
    };
  },

  async trackShipment(awbCode, config) {
    config = this.resolveConfig(config);
    const headers = await authHeaders(config);
    const res = await httpRequest({
      url: `${BASE_URL}/courier/track/awb/${awbCode}`,
      headers,
    });
    const tracking = res.data?.tracking_data;
    return {
      awb: awbCode,
      status: tracking?.shipment_track?.[0]?.current_status,
      location: tracking?.shipment_track?.[0]?.location,
      history: tracking?.shipment_track_activities || [],
    };
  },

  async cancelShipment(awbCodes, config) {
    config = this.resolveConfig(config);
    const headers = await authHeaders(config);
    const res = await httpRequest({
      url: `${BASE_URL}/orders/cancel/shipment/awbs`,
      method: 'POST',
      headers,
      body: { awbs: Array.isArray(awbCodes) ? awbCodes : [awbCodes] },
    });
    return res.data;
  },

  async testConnection(config) {
    config = this.resolveConfig(config);
    if (!config.email || !config.password) throw new Error('Shiprocket email/password not configured');
    await getToken(config);
    delete _tokenCache[config.email]; // clear so next real call re-auths
    return { success: true, message: 'Shiprocket credentials are valid' };
  },
};
