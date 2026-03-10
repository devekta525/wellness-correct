import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import { fetchCategories, fetchBrands } from './store/slices/productSlice';
import Cookies from 'js-cookie';
import { setReferralCode } from './store/slices/cartSlice';
import { referralAPI, trackingAPI } from './services/api';

// Customer Pages
import SplashScreen from './pages/customer/SplashScreen';
import WelcomePage from './pages/customer/WelcomePage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import HomePage from './pages/customer/HomePage';
import CategoryPage from './pages/customer/CategoryPage';
import BrandPage from './pages/customer/BrandPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import SearchPage from './pages/customer/SearchPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import WishlistPage from './pages/customer/WishlistPage';
import ProfilePage from './pages/customer/ProfilePage';
import OrdersPage from './pages/customer/OrdersPage';
import SettingsPage from './pages/customer/SettingsPage';
import ForgotPasswordPage from './pages/customer/ForgotPasswordPage';
import AboutPage from './pages/customer/AboutPage';
import SciencePage from './pages/customer/SciencePage';
import ContactPage from './pages/customer/ContactPage';
import PrivacyPolicyPage from './pages/customer/PrivacyPolicyPage';
import TermsPage from './pages/customer/TermsPage';
import ReturnPolicyPage from './pages/customer/ReturnPolicyPage';
import FaqPage from './pages/customer/FaqPage';
import BlogsPage from './pages/customer/BlogsPage';
import BlogDetailPage from './pages/customer/BlogDetailPage';
import ConsultationPage from './pages/customer/ConsultationPage';
import DoctorBookPage from './pages/customer/DoctorBookPage';
import MyConsultationsPage from './pages/customer/MyConsultationsPage';

// Doctor Pages
import DoctorProfileSetup from './pages/doctor/DoctorProfileSetup';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPrescriptionPage from './pages/doctor/DoctorPrescriptionPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AddEditProductPage from './pages/admin/AddEditProductPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminBrandsPage from './pages/admin/AdminBrandsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import ReferralDashboardPage from './pages/admin/ReferralDashboardPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AISettingsPage from './pages/admin/AISettingsPage';
import GatewaySettingsPage from './pages/admin/GatewaySettingsPage';
import CustomizationPage from './pages/admin/CustomizationPage';
import StudioPage from './pages/admin/StudioPage';
import AbandonedCartsPage from './pages/admin/AbandonedCartsPage';
import ClickTrackingPage from './pages/admin/ClickTrackingPage';
import AdminBlogsPage from './pages/admin/AdminBlogsPage';
import AdminContactPage from './pages/admin/AdminContactPage';
import AdminDoctorsPage from './pages/admin/AdminDoctorsPage';
import AdminLegalPagesPage from './pages/admin/AdminLegalPagesPage';

// Layout
import CustomerLayout from './components/customer/CustomerLayout';
import DoctorLayout from './components/doctor/DoctorLayout';
import { SiteProvider } from './context/SiteContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import Loader from './components/common/Loader';

const detectClickCategory = (el) => {
  const path = window.location.pathname;
  const text = (el.innerText || '').toLowerCase();
  if (el.tagName === 'A') return 'navigation';
  if (path.includes('/product') || el.closest('[data-product]')) return 'product';
  if (text.includes('cart') || text.includes('add to')) return 'cart';
  if (path.includes('/search') || el.closest('form[role="search"]')) return 'search';
  if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') return 'button';
  return 'other';
};

function App() {
  const dispatch = useDispatch();
  const { initialized, user } = useSelector(state => state.auth);
  const { items: cartItems } = useSelector(state => state.cart);
  const cartSyncTimer = useRef(null);

  useEffect(() => {
    // Initialize auth
    const token = localStorage.getItem('Wellness_fuel_token');
    if (token) {
      dispatch(getMe());
    } else {
      // Mark as initialized even without token
      dispatch({ type: 'auth/getMe/rejected' });
    }

    // Load categories
    dispatch(fetchCategories());
    dispatch(fetchBrands());

    // Handle referral code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      dispatch(setReferralCode(refCode));
      Cookies.set('ref_code', refCode, { expires: 30 });
      referralAPI.trackClick(refCode, window.location.pathname).catch(() => { });
    } else {
      const cookieRef = Cookies.get('ref_code');
      if (cookieRef) dispatch(setReferralCode(cookieRef));
    }

    // Apply dark mode
    const darkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.classList.toggle('dark', darkMode);
  }, [dispatch]);

  // ── Cart sync (debounced, auth-gated) ────────────────────────────────
  useEffect(() => {
    if (!user) return;
    if (cartSyncTimer.current) clearTimeout(cartSyncTimer.current);
    cartSyncTimer.current = setTimeout(() => {
      trackingAPI.syncCart(cartItems).catch(() => {});
    }, 3000);
    return () => clearTimeout(cartSyncTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, user]);

  // ── Global click tracking ─────────────────────────────────────────────
  useEffect(() => {
    const sessionId = sessionStorage.getItem('sessionId');

    const handleClick = (e) => {
      const el = e.target.closest('[data-track-id], a, button, [role="button"]');
      if (!el) return;
      trackingAPI.recordClick({
        sessionId,
        page:        window.location.href,
        path:        window.location.pathname,
        elementType: el.tagName.toLowerCase(),
        elementText: el.innerText?.trim().slice(0, 120) || '',
        elementId:   el.dataset?.trackId || el.id || '',
        category:    el.dataset?.trackCategory || detectClickCategory(el),
        metadata:    el.dataset?.trackMeta ? JSON.parse(el.dataset.trackMeta) : undefined,
      }).catch(() => {});
    };

    document.addEventListener('click', handleClick, { capture: true, passive: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, []);

  if (!initialized && localStorage.getItem('Wellness_fuel_token')) {
    return <div className="min-h-screen flex items-center justify-center"><Loader size="lg" /></div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Splash */}
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/welcome" element={<WelcomePage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Customer Routes */}
        <Route element={<SiteProvider><CustomerLayout /></SiteProvider>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/brand/:slug" element={<BrandPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/science" element={<SciencePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/return-policy" element={<ReturnPolicyPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/consultation" element={<ConsultationPage />} />
          <Route path="/consultation/:id" element={<DoctorBookPage />} />
          <Route path="/my-consultations" element={<ProtectedRoute><MyConsultationsPage /></ProtectedRoute>} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
        </Route>

        {/* Doctor Routes — no header/footer */}
        <Route element={<DoctorLayout />}>
          <Route path="/doctor/setup" element={<ProtectedRoute><DoctorProfileSetup /></ProtectedRoute>} />
          <Route path="/doctor/dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/prescription/:consultationId" element={<ProtectedRoute><DoctorPrescriptionPage /></ProtectedRoute>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AddEditProductPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="products/edit/:id" element={<AddEditProductPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="brands" element={<AdminBrandsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="referral" element={<ReferralDashboardPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="ai-settings" element={<AISettingsPage />} />
          <Route path="gateway-settings" element={<GatewaySettingsPage />} />
          <Route path="customization" element={<CustomizationPage />} />
          <Route path="studio" element={<StudioPage />} />
          <Route path="abandoned-carts" element={<AbandonedCartsPage />} />
          <Route path="click-tracking" element={<ClickTrackingPage />} />
          <Route path="blogs" element={<AdminBlogsPage />} />
          <Route path="contact" element={<AdminContactPage />} />
          <Route path="doctors" element={<AdminDoctorsPage />} />
          <Route path="legal-pages" element={<AdminLegalPagesPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
