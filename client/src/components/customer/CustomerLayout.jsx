import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import { useSite } from '../../context/SiteContext';

const CustomerLayout = () => {
  const { site } = useSite();

  useEffect(() => {
    const favicon = site?.favicon;
    if (favicon) {
      let link = document.querySelector('link[rel="icon"]');
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
      link.href = favicon;
    }
  }, [site?.favicon]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-0">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default CustomerLayout;
