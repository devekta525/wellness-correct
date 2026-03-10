import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasVisited = localStorage.getItem('Wellness_fuel_visited');
      navigate(hasVisited ? '/' : '/welcome');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-purple-600 to-pink-500 flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce-slow">
          <span className="text-white font-black text-4xl">A</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-2">Wellness_fuel</h1>
        <p className="text-white/80 text-lg">AI-Powered Shopping</p>
        <div className="mt-8 flex justify-center gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
