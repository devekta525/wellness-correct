const httpRequest = require('../../../utils/httpRequest');

const _baseUrl = (config) =>
  config.mode === 'live'
    ? 'https://track.delhivery.com'
    : 'https://staging-express.delhivery.com';

const _headers = (config) => ({
  Authorization: `Token ${config.api_token}`,
  'Content-Type': 'application/json',
});

module.exports = {
  id: 'delhivery',
  displayName: 'Delhivery',
  description: 'Pan-India courier and logistics with real-time tracking',
  fields: [
    { key: 'api_token', label: 'API Token', type: 'password', placeholder: 'Your Delhivery API Token', required: true },
    { key: 'warehouse_name', label: 'Warehouse Name', type: 'text', placeholder: 'Your warehouse / client name', required: true },
  ],

  async checkServiceability({ pincode }, config) {
    const res = await httpRequest({
      url: `${_baseUrl(config)}/api/kinko/v1.0/check_serviceability/?token=${config.api_token}&type=express&pin=${pincode}`,
      headers: _headers(config),
    });
    return res.data;
  },

  async createShipment(orderData, config) {
    const payload = {
      format: 'json',
      data: JSON.stringify({
        shipments: [{
          name: orderData.customerName,
          add: orderData.address.street,
          pin: orderData.address.pincode,
          city: orderData.address.city,
          state: orderData.address.state,
          country: 'India',
          phone: orderData.address.phone,
          order: String(orderData.orderId),
          payment_mode: orderData.paymentMethod === 'cod' ? 'COD' : 'Pre-paid',
          return_pin: config.return_pin || orderData.address.pincode,
          return_city: config.return_city || orderData.address.city,
          return_phone: config.return_phone || orderData.address.phone,
          return_name: config.warehouse_name || 'Store',
          return_add: config.return_address || orderData.address.street,
          return_state: config.return_state || orderData.address.state,
          return_country: 'India',
          products_desc: orderData.items.map(i => i.title).join(', '),
          hsn_code: '',
          cod_amount: orderData.paymentMethod === 'cod' ? String(orderData.total) : '0',
          order_date: new Date().toISOString(),
          total_amount: String(orderData.total),
          seller_add: config.return_address || '',
          seller_name: config.warehouse_name || 'Store',
          seller_inv: String(orderData.orderId),
          quantity: String(orderData.items.reduce((s, i) => s + i.quantity, 0)),
          weight: String(orderData.weight || 500), // grams
          shipment_length: String(orderData.length || 10),
          shipment_width: String(orderData.breadth || 10),
          shipment_height: String(orderData.height || 10),
          seller_gst_tin: config.gst || '',
          shipping_mode: 'Surface',
          address_type: 'home',
        }],
        pickup_location: { name: config.warehouse_name },
      }),
    };

    const res = await httpRequest({
      url: `${_baseUrl(config)}/api/cmu/create.json`,
      method: 'POST',
      headers: {
        Authorization: `Token ${config.api_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload).toString(),
    });

    const pkg = res.data?.packages?.[0];
    return {
      waybill: pkg?.waybill,
      status: pkg?.status,
      remarks: pkg?.remarks,
    };
  },

  async trackShipment(waybill, config) {
    const res = await httpRequest({
      url: `${_baseUrl(config)}/api/v1/packages/json/?waybill=${waybill}&verbose=2`,
      headers: _headers(config),
    });
    const data = res.data?.ShipmentData?.[0]?.Shipment;
    return {
      waybill,
      status: data?.Status,
      location: data?.Scans?.[0]?.ScanDetail?.ScannedLocation,
      history: (data?.Scans || []).map(s => ({
        date: s.ScanDetail?.ScanDateTime,
        status: s.ScanDetail?.Scan,
        location: s.ScanDetail?.ScannedLocation,
      })),
    };
  },

  async testConnection(config) {
    if (!config.api_token) throw new Error('Delhivery API token not configured');
    if (config.api_token.length < 10) throw new Error('Invalid Delhivery API token');
    await httpRequest({
      url: `${_baseUrl(config)}/api/kinko/v1.0/check_serviceability/?token=${config.api_token}&type=express&pin=110001`,
      headers: _headers(config),
    });
    return { success: true, message: 'Delhivery credentials are valid' };
  },
};
