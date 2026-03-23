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

const getPickupLocations = async (config) => {
  const headers = await authHeaders(config);
  const res = await httpRequest({
    url: `${BASE_URL}/settings/company/pickup`,
    headers,
  });
  return res.data?.data?.shipping_address || [];
};

const resolvePickupLocation = async (config) => {
  const locations = await getPickupLocations(config);
  if (!locations.length) return config.pickup_location || 'Primary';

  const configured = String(config.pickup_location || '').trim().toLowerCase();
  const matched = configured
    ? locations.find((location) => String(location.pickup_location || '').trim().toLowerCase() === configured)
    : null;

  if (matched?.pickup_location) return matched.pickup_location;

  const primary = locations.find((location) => Number(location.is_primary_location) === 1);
  return primary?.pickup_location || locations[0]?.pickup_location || config.pickup_location || 'Primary';
};

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
    const pickupLocation = await resolvePickupLocation(config);
    const orderRes = await httpRequest({
      url: `${BASE_URL}/orders/create/adhoc`,
      method: 'POST',
      headers,
      body: {
        order_id: orderData.orderId,
        order_date: new Date().toISOString().split('T')[0],
        pickup_location: pickupLocation,
        billing_customer_name: orderData.customerName,
        billing_last_name: '',
        billing_address: orderData.address.street,
        billing_city: orderData.address.city,
        billing_pincode: orderData.address.pincode,
        billing_state: orderData.address.state,
        billing_country: orderData.address.country || 'India',
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
        sub_total: orderData.subtotal || orderData.total,
        length: orderData.length || 10,
        breadth: orderData.breadth || 10,
        height: orderData.height || 10,
        weight: orderData.weight || 0.5,
      },
    });

    const createdOrder = orderRes.data || {};
    const shipmentId = createdOrder.shipment_id || createdOrder?.shipment_details?.shipment_id;
    const createdOrderId = createdOrder.order_id;

    if (!shipmentId) {
      throw new Error('Shiprocket order created but shipment_id was not returned');
    }

    const awbPayload = { shipment_id: shipmentId };
    const preferredCourierId = orderData.courierId || orderData.courier_company_id || orderData.courierCompanyId;
    if (preferredCourierId) awbPayload.courier_id = preferredCourierId;

    const awbRes = await httpRequest({
      url: `${BASE_URL}/courier/assign/awb`,
      method: 'POST',
      headers,
      body: awbPayload,
    });

    const awbData = awbRes.data?.response?.data || awbRes.data?.data || awbRes.data || {};
    return {
      shipmentId,
      orderId: createdOrderId || awbData.order_id,
      awbCode: awbData.awb_code,
      courierId: awbData.courier_company_id,
      courierName: awbData.courier_name,
      pickupLocation,
      status: awbData.awb_code_status || createdOrder.status || createdOrder.order_status,
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
    const pickupLocation = await resolvePickupLocation(config);
    delete _tokenCache[config.email]; // clear so next real call re-auths
    return { success: true, message: `Shiprocket credentials are valid (pickup location: ${pickupLocation})` };
  },
};
