import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// OTP-based auth handles both login and registration.
// Redirect /register to /login.
const RegisterPage = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/login', { replace: true }); }, [navigate]);
  return null;
};

export default RegisterPage;
