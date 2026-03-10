import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { register } from '../../store/slices/authSlice';
import { siteAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

// Defined outside so it isn't recreated each render (fixes input focus / "can't type in one go")
const Field = ({ icon: Icon, name, type = 'text', placeholder, label, value, onChange, onClearError, error, isPassword, showPassword, onTogglePassword }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
        value={value}
        onChange={e => { onChange(e.target.value); onClearError?.(); }}
        className={`input pl-10 ${error ? 'border-red-500 focus:ring-red-500' : ''} ${isPassword ? 'pr-10' : ''}`}
        placeholder={placeholder}
      />
      {isPassword && (
        <button type="button" onClick={onTogglePassword}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useSelector(state => state.auth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
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
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!agreed) errs.agreed = 'You must agree to terms';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    dispatch(register({ name: form.name, email: form.email, phone: form.phone, password: form.password }));
  };

  const setField = (name, value) => {
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-xl">
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
            <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
            <p className="text-gray-500 mt-1">Join millions of happy shoppers</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field icon={User} name="name" placeholder="John Doe" label="Full Name" value={form.name} onChange={v => setField('name', v)} onClearError={() => setErrors(p => ({ ...p, name: '' }))} error={errors.name} />
            <Field icon={Mail} name="email" type="email" placeholder="you@example.com" label="Email address" value={form.email} onChange={v => setField('email', v)} onClearError={() => setErrors(p => ({ ...p, email: '' }))} error={errors.email} />
            <Field icon={Phone} name="phone" type="tel" placeholder="+91 98765 43210" label="Phone Number (optional)" value={form.phone} onChange={v => setField('phone', v)} onClearError={() => setErrors(p => ({ ...p, phone: '' }))} error={errors.phone} />
            <Field icon={Lock} name="password" type="password" placeholder="••••••••" label="Password" value={form.password} onChange={v => setField('password', v)} onClearError={() => setErrors(p => ({ ...p, password: '' }))} error={errors.password} isPassword showPassword={showPassword} onTogglePassword={() => setShowPassword(s => !s)} />
            <Field icon={Lock} name="confirmPassword" type="password" placeholder="••••••••" label="Confirm Password" value={form.confirmPassword} onChange={v => setField('confirmPassword', v)} onClearError={() => setErrors(p => ({ ...p, confirmPassword: '' }))} error={errors.confirmPassword} isPassword showPassword={showPassword} onTogglePassword={() => setShowPassword(s => !s)} />

            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link> and{' '}
                <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.agreed && <p className="text-red-500 text-xs">{errors.agreed}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <Loader size="sm" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
