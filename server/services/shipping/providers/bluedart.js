const httpRequest = require('../../../utils/httpRequest');

// BlueDart uses SOAP / REST depending on service. This uses their REST/JSON courier APIs.
// Note: BlueDart API access requires an enterprise account and approval.

const _baseUrl = (config) =>
  config.mode === 'live'
    ? 'https://netconnect.bluedart.com'
    : 'https://apigateway.bluedart.com/in/transportation/courier/v1';

const _headers = (config) => ({
  'JWTToken': config.jwt_token,
  'clientid': config.license_key,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

module.exports = {
  id: 'bluedart',
  displayName: 'BlueDart',
  description: 'Premium express delivery by BlueDart (DHL Group)',
  fields: [
    { key: 'license_key', label: 'License Key', type: 'text', placeholder: 'Your BlueDart License Key', required: true },
    { key: 'login_id', label: 'Login ID', type: 'text', placeholder: 'Your BlueDart Login ID', required: true },
    { key: 'jwt_token', label: 'JWT Token', type: 'password', placeholder: 'JWT Token from BlueDart portal', required: true },
  ],

  async checkServiceability({ pincode, productCode = 'D' }, config) {
    const res = await httpRequest({
      url: `${_baseUrl(config)}/rate?handler=tnt&action=pincode`,
      method: 'POST',
      headers: _headers(config),
      body: {
        handler: 'tnt',
        action: 'pincode',
        pinCode: pincode,
        pickupPinCode: config.pickup_pincode || '',
        productCode,
        subProductCode: '',
        loginid: config.login_id,
        licKey: config.license_key,
        verno: '1.3',
        isToAddress: '1',
      },
    });
    return res.data;
  },

  async createShipment(orderData, config) {
    const res = await httpRequest({
      url: `${_baseUrl(config)}/shipment?handler=tnt&action=shpCreation`,
      method: 'POST',
      headers: _headers(config),
      body: {
        Consignee: {
          ConsigneeName: orderData.customerName,
          ConsigneeAddress1: orderData.address.street,
          ConsigneeAddress2: '',
          ConsigneeAddress3: '',
          ConsigneePincode: orderData.address.pincode,
          ConsigneeCity: orderData.address.city,
          ConsigneeState: orderData.address.state,
          ConsigneeCountry: 'IN',
          ConsigneeMobile: orderData.address.phone,
          ConsigneeAttention: orderData.customerName,
        },
        Services: {
          ProductCode: 'D',
          SubProductCode: '',
          ActualWeight: String(orderData.weight || 0.5),
          CollectableAmount: orderData.paymentMethod === 'cod' ? String(orderData.total) : '0',
          DeclaredValue: String(orderData.total),
          ItemCount: String(orderData.items.reduce((s, i) => s + i.quantity, 0)),
          Dimensions: [{ Length: orderData.length || 10, Breadth: orderData.breadth || 10, Height: orderData.height || 10, Count: 1 }],
          PickupDate: `/Date(${Date.now()})/`,
          PickupTime: '1000',
          ReversePickup: false,
          CreditReferenceNo: String(orderData.orderId),
        },
        Shipper: {
          OriginArea: config.origin_area || 'DEL',
          LoginID: config.login_id,
          Name: config.shipper_name || 'Store',
          Address1: config.shipper_address || '',
          Pincode: config.pickup_pincode || '',
          Mobile: config.shipper_phone || '',
        },
      },
    });

    return {
      awbNumber: res.data?.AWBNo,
      status: res.data?.Status,
      remarks: res.data?.Remarks,
    };
  },

  async trackShipment(awbNumber, config) {
    const res = await httpRequest({
      url: `${_baseUrl(config)}/track?handler=tnt&action=cusTrkDetail`,
      method: 'POST',
      headers: _headers(config),
      body: {
        handler: 'tnt',
        action: 'cusTrkDetail',
        AWBNo: awbNumber,
        LoginID: config.login_id,
        LicKey: config.license_key,
        verno: '1.3',
      },
    });

    const scans = res.data?.ShipmentData?.Scans || [];
    return {
      awb: awbNumber,
      status: scans[0]?.ScanDetail?.Scan,
      location: scans[0]?.ScanDetail?.ScannedLocation,
      history: scans.map(s => ({
        date: s.ScanDetail?.ScanDateTime,
        status: s.ScanDetail?.Scan,
        location: s.ScanDetail?.ScannedLocation,
      })),
    };
  },

  async testConnection(config) {
    if (!config.license_key || !config.login_id || !config.jwt_token) {
      throw new Error('BlueDart License Key, Login ID and JWT Token are required');
    }
    return { success: true, message: 'BlueDart credentials saved (full validation requires a live transaction)' };
  },
};
