import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin, Stethoscope } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

const socialIcons = [
  { key: 'facebook', Icon: Facebook },
  { key: 'twitter', Icon: Twitter },
  { key: 'instagram', Icon: Instagram },
  { key: 'linkedin', Icon: Linkedin },
  { key: 'youtube', Icon: Youtube },
];

const Footer = () => {
  const { site } = useSite();
  const { user } = useSelector((s) => s.auth) || {};
  const { social = {}, contact = {}, logo, logoDark } = site || {};
  const footerLogo = logoDark || logo;
  const isDoctor = user?.role === 'doctor';
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12 sm:mt-16 pb-safe">
      <div className="page-container py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              {footerLogo ? (
                <img src={footerLogo} alt="Site logo" className="h-9 w-auto max-w-[120px] object-contain" />
              ) : (
                <div className="h-9 w-[120px] max-w-[120px] rounded-lg bg-gray-800 border border-dashed border-gray-600 flex items-center justify-center" aria-hidden>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Logo</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              AI-powered e-commerce platform delivering exceptional shopping experiences.
            </p>
            <div className="flex gap-3">
              {socialIcons.map(({ key, Icon }) => (
                social[key] ? (
                  <a key={key} href={social[key]} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors" aria-label={key}>
                    <Icon size={14} />
                  </a>
                ) : (
                  <span key={key} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center opacity-50">
                    <Icon size={14} />
                  </span>
                )
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home', to: '/' },
                { label: 'Products', to: '/search' },
                { label: 'About Us', to: '/about' },
                { label: 'Contact', to: '/contact' },
                { label: 'Blog', to: '/blog' },
                { label: isDoctor ? 'Doctor Portal' : 'Join as Doctor', to: isDoctor ? '/doctor/dashboard' : '/doctor/setup', icon: Stethoscope },
              ].map(({ label, to, icon: Icon }) => (
                <li key={to}>
                  <Link to={to} className="text-sm hover:text-primary-400 transition-colors inline-flex items-center gap-1.5">
                    {Icon && <Icon size={12} className="text-teal-400 flex-shrink-0" />}
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {[
                { label: 'My Account', to: '/profile' },
                { label: 'Track Order', to: '/orders' },
                { label: 'Returns & Refunds', to: '/return-policy' },
                { label: 'FAQ', to: '/faq' },
                { label: 'Privacy Policy', to: '/privacy-policy' },
                { label: 'Terms of Service', to: '/terms' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-sm hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              {contact.address && (
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-primary-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{contact.address}</span>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-primary-400 flex-shrink-0" />
                  <a href={`tel:${contact.phone}`} className="text-sm hover:text-primary-400">{contact.phone}</a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-primary-400 flex-shrink-0" />
                  <a href={`mailto:${contact.email}`} className="text-sm hover:text-primary-400">{contact.email}</a>
                </li>
              )}
              {!contact.address && !contact.phone && !contact.email && (
                <li className="text-sm text-gray-500">Add contact details in Admin → Customization</li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 text-center md:text-left">© {new Date().getFullYear()} Wellness_fuel. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5 sm:h-6 opacity-60" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3 sm:h-4 opacity-60" />
            <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">UPI</span>
            <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
