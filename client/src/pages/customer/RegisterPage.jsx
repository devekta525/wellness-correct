import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { register, getMe } from '../../store/slices/authSlice';
import { siteAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

// Defined outside so it isn't recreated each render (fixes input focus / "can't type in one go")
const Field = ({ icon: Icon, name, type = 'text', placeholder, label, value, onChange, onClearError, error, isPassword, showPassword, onTogglePassword }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
    <div className="relative">
      <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
      <input
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
        value={value}
        onChange={e => { onChange(e.target.value); onClearError?.(); }}
        className={`input pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border placeholder:text-gray-400 dark:placeholder:text-gray-500 ${error ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700'} ${isPassword ? 'pr-10' : ''}`}
        placeholder={placeholder}
      />
      {isPassword && (
        <button type="button" onClick={onTogglePassword}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
    {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

const PHONE_REGEX = /^\d{10}$/;
const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return null;
  const digits = phone.replace(/\D/g, '');
  if (!PHONE_REGEX.test(digits)) return 'Phone must be exactly 10 digits (India)';
  return null;
};

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useSelector(state => state.auth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'customer' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [siteLogo, setSiteLogo] = useState('');

  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated, navigate]);
  useEffect(() => {
    siteAPI.getSite().then((r) => { if (r.data?.site?.logo) setSiteLogo(r.data.site.logo); }).catch(() => { });
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email?.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Please enter a valid email address';
    const phoneErr = validatePhone(form.phone);
    if (phoneErr) errs.phone = phoneErr;
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!agreed) errs.agreed = 'You must agree to the terms and privacy policy';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      await dispatch(register({ name: form.name, email: form.email, phone: form.phone.replace(/\D/g, '').slice(0, 10) || undefined, password: form.password, role: form.role })).unwrap();
      dispatch(getMe());
    } catch (_) {}
  };

  const setField = (name, value) => {
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6">
              {siteLogo ? (
                <img src={siteLogo} alt="Logo" className="h-10 w-auto max-w-[180px] object-contain" />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-black">A</span>
                  </div>
                  <span className="text-2xl font-black bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">Wellness_fuel</span>
                </>
              )}
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Create an account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Join millions of happy shoppers</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field icon={User} name="name" placeholder="John Doe" label="Full Name" value={form.name} onChange={v => setField('name', v)} onClearError={() => setErrors(p => ({ ...p, name: '' }))} error={errors.name} />
            <Field icon={Mail} name="email" type="email" placeholder="you@example.com" label="Email address" value={form.email} onChange={v => setField('email', v)} onClearError={() => setErrors(p => ({ ...p, email: '' }))} error={errors.email} />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">I am signing up as</label>
              <select value={form.role} onChange={e => setField('role', e.target.value)} className="input py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>
            <Field icon={Phone} name="phone" type="tel" placeholder="10-digit mobile number" label="Phone Number (optional)" value={form.phone} onChange={v => { const digits = v.replace(/\D/g, '').slice(0, 10); setField('phone', digits); }} onClearError={() => setErrors(p => ({ ...p, phone: '' }))} error={errors.phone} />
            <Field icon={Lock} name="password" type="password" placeholder="••••••••" label="Password" value={form.password} onChange={v => setField('password', v)} onClearError={() => setErrors(p => ({ ...p, password: '' }))} error={errors.password} isPassword showPassword={showPassword} onTogglePassword={() => setShowPassword(s => !s)} />
            <Field icon={Lock} name="confirmPassword" type="password" placeholder="••••••••" label="Confirm Password" value={form.confirmPassword} onChange={v => setField('confirmPassword', v)} onClearError={() => setErrors(p => ({ ...p, confirmPassword: '' }))} error={errors.confirmPassword} isPassword showPassword={showPassword} onTogglePassword={() => setShowPassword(s => !s)} />

            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" checked={agreed} onChange={e => { setAgreed(e.target.checked); setErrors(p => ({ ...p, agreed: '' })); }}
                className="mt-0.5 w-4 h-4 text-primary-600 rounded border-gray-300 dark:border-gray-600 focus:ring-primary-500 bg-white dark:bg-gray-800" />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</Link> and{' '}
                <Link to="/privacy-policy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.agreed && <p className="text-red-500 dark:text-red-400 text-xs">{errors.agreed}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <Loader size="sm" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
