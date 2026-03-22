import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor - attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('Wellness_fuel_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Session ID for referral tracking
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', sessionId);
  }
  config.headers['x-session-id'] = sessionId;

  return config;
});

// Response interceptor
API.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('Wellness_fuel_token');
      const path = window.location.pathname;
      const isAuthPage = path === '/login' || path === '/admin/login';
      if (!isAuthPage) {
        window.location.href = path.startsWith('/admin') ? '/admin/login' : '/login';
      }
    }
    return Promise.reject({ message, status: error.response?.status });
  }
);

// Auth
export const authAPI = {
  sendOtp: (email) => API.post('/auth/send-otp', { email }),
  verifyOtp: (data) => API.post('/auth/verify-otp', data),
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  adminLogin: (data) => API.post('/auth/admin/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post(`/auth/reset-password/${token}`, { password }),
  addAddress: (data) => API.post('/auth/addresses', data),
  toggleWishlist: (productId) => API.post(`/auth/wishlist/${productId}`),
  deleteAccount: () => API.delete('/auth/account'),
};

// Products
export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getBySlug: (slug) => API.get(`/products/${slug}`),
  getFeatured: () => API.get('/products/featured'),
  getFlashDeals: () => API.get('/products/flash-deals'),
  // Admin
  adminGetAll: (params) => API.get('/admin/products', { params }),
  adminGetById: (id) => API.get(`/admin/products/${id}`),
  create: (data) => API.post('/admin/products', data),
  update: (id, data) => API.put(`/admin/products/${id}`, data),
  delete: (id) => API.delete(`/admin/products/${id}`),
  updateImages: (id, images) => API.post(`/admin/products/${id}/images`, { images }),
  upload: (formData) => API.post('/admin/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Categories
export const categoryAPI = {
  getAll: () => API.get('/categories'),
  getBySlug: (slug) => API.get(`/categories/${slug}`),
  // Admin
  adminGetAll: () => API.get('/admin/categories'),
  create: (data) => API.post('/admin/categories', data),
  update: (id, data) => API.put(`/admin/categories/${id}`, data),
  delete: (id) => API.delete(`/admin/categories/${id}`),
};

// Brands
export const brandAPI = {
  getAll: () => API.get('/brands'),
  getBySlug: (slug) => API.get(`/brands/${slug}`),
  // Admin
  adminGetAll: () => API.get('/admin/brands'),
  create: (data) => API.post('/admin/brands', data),
  update: (id, data) => API.put(`/admin/brands/${id}`, data),
  delete: (id) => API.delete(`/admin/brands/${id}`),
};

// Orders
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getMyOrders: (params) => API.get('/orders/my', { params }),
  getById: (id) => API.get(`/orders/${id}`),
  // Admin
  adminGetAll: (params) => API.get('/admin/orders', { params }),
  updateStatus: (id, data) => API.put(`/admin/orders/${id}/status`, data),
  updatePayment: (id, data) => API.put(`/admin/orders/${id}/payment`, data),
};

// Reviews
export const reviewAPI = {
  create: (data) => API.post('/reviews', data),
  getByProduct: (productId, params) => API.get(`/reviews/product/${productId}`, { params }),
  getRecent: (params) => API.get('/reviews/recent', { params }),
  // Admin
  getAll: (params) => API.get('/admin/reviews', { params }),
  update: (id, data) => API.put(`/admin/reviews/${id}`, data),
};

// Coupons
export const couponAPI = {
  validate: (code, orderAmount) => API.post('/coupons/validate', { code, orderAmount }),
  // Admin
  getAll: (params) => API.get('/admin/coupons', { params }),
  create: (data) => API.post('/admin/coupons', data),
  update: (id, data) => API.put(`/admin/coupons/${id}`, data),
  delete: (id) => API.delete(`/admin/coupons/${id}`),
};

// Referral
export const referralAPI = {
  trackClick: (code, landingPage) => API.post('/referral/track', { code, landingPage }),
  // Admin
  getCodes: (params) => API.get('/admin/referral/codes', { params }),
  createCode: (data) => API.post('/admin/referral/codes', data),
  updateCode: (id, data) => API.put(`/admin/referral/codes/${id}`, data),
  deleteCode: (id) => API.delete(`/admin/referral/codes/${id}`),
  getAnalytics: (params) => API.get('/admin/referral/analytics', { params }),
  exportCSV: (params) => API.get('/admin/referral/analytics/export', { params, responseType: 'blob' }),
};

// AI
export const aiAPI = {
  analyzeImage: (formData) => API.post('/admin/ai/analyze-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }),
  regenerate: (imageUrl, context) => API.post('/admin/ai/regenerate', { imageUrl, additionalContext: context }),
  generateSEO: (data) => API.post('/admin/ai/generate-seo', data),
  getSettings: () => API.get('/admin/ai/settings'),
  saveSettings: (data) => API.post('/admin/ai/settings', data),
  test: () => API.get('/admin/ai/test'),
  studioMockup: (formData) => API.post('/admin/ai/studio/mockup', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  }),
};

// Site (public – homepage, footer)
export const siteAPI = {
  getSite: () => API.get('/site'),
};

// Admin
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getCustomization: () => API.get('/admin/customization'),
  updateCustomization: (data) => API.put('/admin/customization', data),
  uploadSiteAsset: (formData) => API.post('/admin/customization/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getUsers: (params) => API.get('/admin/users', { params }),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  getSettings: () => API.get('/admin/settings'),
  updateSettings: (settings) => API.put('/admin/settings', { settings }),
  getSalesAnalytics: (params) => API.get('/admin/analytics/sales', { params }),
  getReportTypes: () => API.get('/admin/reports/types'),
  downloadReport: (params) => API.get('/admin/reports/excel', { params, responseType: 'blob' }),
  createNotification: (data) => API.post('/admin/notifications', data),
  getNotifications: () => API.get('/admin/notifications'),
  // Gateway management
  getPaymentGateways: () => API.get('/admin/gateways/payment'),
  savePaymentGateway: (id, data) => API.put(`/admin/gateways/payment/${id}`, data),
  testPaymentGateway: (id, body = {}) => API.post(`/admin/gateways/payment/${id}/test`, body),
  getShippingProviders: () => API.get('/admin/gateways/shipping'),
  saveShippingProvider: (id, data) => API.put(`/admin/gateways/shipping/${id}`, data),
  testShippingProvider: (id, body = {}) => API.post(`/admin/gateways/shipping/${id}/test`, body),
};

// Payments
export const paymentAPI = {
  getActiveGateways: () => API.get('/payments/gateways'),
  createOrder: (data) => API.post('/payments/order', data),
  verify: (data) => API.post('/payments/verify', data),
};

// Shipping
export const shippingAPI = {
  getProvider: () => API.get('/shipping/provider'),
  getRates: (data) => API.post('/shipping/rates', data),
  track: (trackingId) => API.get(`/shipping/track/${trackingId}`),
};

// Doctors & Consultations
export const doctorAPI = {
  // Public
  getAll: (params) => API.get('/doctors', { params }),
  getById: (id) => API.get(`/doctors/${id}`),
  getBookedSlots: (id, params) => API.get(`/doctors/${id}/booked-slots`, { params }),
  getSpecializations: () => API.get('/doctors/specializations'),
  searchMedicines: (q, page = 1) => API.get('/doctors/medicines/search', { params: { q, page, limit: 20 } }),
  // Patient
  book: (doctorId, data) => API.post(`/doctors/${doctorId}/book`, data),
  verifyConsultationPayment: (data) => API.post('/doctors/consultations/payment/verify', data),
  getMyConsultations: (params) => API.get('/doctors/my-consultations', { params }),
  getMyPrescriptions: () => API.get('/doctors/my-prescriptions'),
  // Doctor dashboard
  getMyProfile: () => API.get('/doctors/me/profile'),
  upsertMyProfile: (data) => API.post('/doctors/me/profile', data),
  uploadProfileImage: (formData) => API.post('/doctors/me/upload-profile-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyConsultationsAsDoctor: (params) => API.get('/doctors/me/consultations', { params }),
  updateConsultationStatus: (id, data) => API.put(`/doctors/me/consultations/${id}/status`, data),
  createPrescription: (consultationId, data) => API.post(`/doctors/me/consultations/${consultationId}/prescription`, data),
  getPrescription: (consultationId) => API.get(`/doctors/me/consultations/${consultationId}/prescription`),
  // Admin
  adminGetAll: (params) => API.get('/admin/doctors', { params }),
  adminGetById: (id) => API.get(`/admin/doctors/${id}`),
  adminUpdate: (id, data) => API.put(`/admin/doctors/${id}`, data),
  adminDelete: (id) => API.delete(`/admin/doctors/${id}`),
  adminGetConsultations: (params) => API.get('/admin/consultations', { params }),
};

// Blogs
export const blogAPI = {
  getAll: (params) => API.get('/blogs', { params }),
  getBySlug: (slug) => API.get(`/blogs/${slug}`),
  getCategories: () => API.get('/blogs/categories'),
  // Admin
  adminGetAll: (params) => API.get('/admin/blogs', { params }),
  adminGetById: (id) => API.get(`/admin/blogs/${id}`),
  create: (data) => API.post('/admin/blogs', data),
  update: (id, data) => API.put(`/admin/blogs/${id}`, data),
  delete: (id) => API.delete(`/admin/blogs/${id}`),
};

// Contact
export const contactAPI = {
  getInfo: () => API.get('/site/contact'),
  submit: (data) => API.post('/site/contact', data),
  // Admin
  adminGetInfo: () => API.get('/admin/contact-info'),
  adminUpdateInfo: (data) => API.put('/admin/contact-info', data),
};

// Tracking (cart sync + click events)
export const trackingAPI = {
  syncCart: (items) => API.post('/tracking/cart', { items }),
  recordClick: (data) => API.post('/tracking/click', data),
};

// Abandoned Carts (Admin)
export const abandonedCartAPI = {
  getAll: (params) => API.get('/admin/abandoned-carts', { params }),
};

// Click Tracking (Admin)
export const clickTrackingAPI = {
  getAnalytics: (params) => API.get('/admin/click-tracking', { params }),
  getUserHistory: (userId, params) => API.get(`/admin/click-tracking/user/${userId}`, { params }),
};

// Legal Pages
export const legalAPI = {
  getPage: (page) => API.get(`/legal/${page}`),
  adminGetPage: (page) => API.get(`/admin/legal/${page}`),
  updatePage: (page, content) => API.put(`/admin/legal/${page}`, { content }),
};

export default API;
