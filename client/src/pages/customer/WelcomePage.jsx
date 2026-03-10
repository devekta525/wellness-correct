import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Truck, Shield, Zap, Star } from 'lucide-react';

const WelcomePage = () => {
  useEffect(() => {
    localStorage.setItem('Wellness_fuel_visited', 'true');
  }, []);

  const features = [
    { icon: Truck, title: 'Fast Delivery', desc: 'Get your orders in 2-7 days', color: 'text-blue-500' },
    { icon: Shield, title: 'Secure Shopping', desc: '100% safe & encrypted', color: 'text-green-500' },
    { icon: Zap, title: 'AI Powered', desc: 'Smart product recommendations', color: 'text-yellow-500' },
    { icon: Star, title: 'Best Deals', desc: 'Exclusive offers every day', color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-6">
      <div className="text-center text-white mb-12">
        <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span className="text-white font-black text-3xl">A</span>
        </div>
        <h1 className="text-4xl font-black mb-3">Welcome to Wellness_fuel</h1>
        <p className="text-white/80 text-lg max-w-md mx-auto">
          Your AI-powered shopping destination with millions of products and exclusive deals.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-sm w-full mb-10">
        {features.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-white text-center">
            <Icon size={24} className={`mx-auto mb-2 ${color}`} />
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-white/70 mt-1">{desc}</p>
          </div>
        ))}
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Link to="/register" className="block w-full bg-white text-primary-600 font-bold py-4 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all active:scale-95">
          Get Started — It's Free
        </Link>
        <Link to="/login" className="block w-full bg-white/20 backdrop-blur-sm text-white font-semibold py-4 rounded-2xl text-center border border-white/30 hover:bg-white/30 transition-all">
          I already have an account
        </Link>
        <Link to="/" className="block text-center text-white/70 text-sm hover:text-white transition-colors py-2">
          Continue as Guest →
        </Link>
      </div>
    </div>
  );
};

export default WelcomePage;
