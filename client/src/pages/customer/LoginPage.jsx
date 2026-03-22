import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
import { sendOtp, verifyOtp, getMe } from '../../store/slices/authSlice';
import { siteAPI } from '../../services/api';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, isAuthenticated, user } = useSelector(state => state.auth);

  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sending, setSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [siteLogo, setSiteLogo] = useState('');

  const otpRefs = useRef([]);
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (!isAuthenticated) return;
    const destination = user?.role === 'doctor' ? '/doctor/dashboard' : from;
    navigate(destination, { replace: true });
  }, [isAuthenticated, user?.role, navigate, from]);

  useEffect(() => {
    siteAPI.getSite().then((r) => { if (r.data?.site?.logo) setSiteLogo(r.data.site.logo); }).catch(() => {});
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
    setSending(true);
    try {
      await dispatch(sendOtp(email.trim())).unwrap();
      setStep('otp');
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      // Error toast handled by slice
    } finally {
      setSending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5 && newOtp.every(d => d)) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    if (pasted.length === 6) {
      handleVerifyOtp(pasted);
    } else {
      otpRefs.current[pasted.length]?.focus();
    }
  };

  const handleVerifyOtp = async (otpString) => {
    const code = otpString || otp.join('');
    if (code.length !== 6) return;
    try {
      await dispatch(verifyOtp({ email: email.trim(), otp: code })).unwrap();
      dispatch(getMe());
    } catch {
      // Error toast handled by slice
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    handleSendOtp();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-xl bg-white dark:bg-gray-950">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6">
              {siteLogo ? (
                <img src={siteLogo} alt="Logo" className="h-10 w-auto max-w-[180px] object-contain" />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-black">W</span>
                  </div>
                  <span className="text-2xl font-black bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">Wellness Fuel</span>
                </>
              )}
            </Link>

            {step === 'email' ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Welcome!</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Enter your email to get started</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Verify OTP</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  We sent a 6-digit code to<br />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span>
                </p>
              </>
            )}
          </div>

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input pl-10 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                    placeholder="you@example.com"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" disabled={sending || loading} className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2">
                {(sending || loading) ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending OTP...</>
                ) : (
                  <>Send OTP <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <div className="space-y-6">
              {/* OTP Input boxes */}
              <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none transition-all"
                  />
                ))}
              </div>

              <button
                onClick={() => handleVerifyOtp()}
                disabled={loading || otp.join('').length !== 6}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                ) : (
                  'Verify & Continue'
                )}
              </button>

              {/* Resend */}
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Didn't receive the code?{' '}
                  {resendTimer > 0 ? (
                    <span className="text-gray-400 dark:text-gray-500">Resend in {resendTimer}s</span>
                  ) : (
                    <button onClick={handleResend} className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300">
                      Resend OTP
                    </button>
                  )}
                </p>
              </div>

              {/* Change email */}
              <button
                onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); }}
                className="w-full text-center text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Change email address
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <ArrowLeft size={14} />Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
