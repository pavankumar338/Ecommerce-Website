import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiInstagram, FiFacebook, FiTwitter, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { useShop } from '../context/ShopContext';

export const Footer: React.FC = () => {
  const { user } = useShop();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('Thank you for subscribing to our newsletter! ✨ 10% discount code sent.');
      setEmail('');
    } else {
      toast.error('Please enter a valid email address.');
    }
  };

  return (
    <footer className="bg-brand-cream dark:bg-brand-charcoal/30 border-t border-brand-beige-dark/20 text-brand-charcoal dark:text-brand-cream-dark transition-colors duration-300">

      {/* Newsletter Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-brand-beige-dark/20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-serif text-2xl font-bold tracking-wide">Join the Dresiq Club</h3>
            <p className="text-sm mt-2 text-brand-charcoal/60 dark:text-brand-cream/60">
              Subscribe to receive updates on new collections, exclusive sales, and a 10% discount on your first order.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md lg:ml-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white dark:bg-brand-charcoal/80 text-xs px-4 py-3 rounded-md border border-brand-beige-dark/50 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                required
              />
              <button
                type="submit"
                className="bg-brand-charcoal dark:bg-brand-cream text-white dark:text-brand-charcoal text-xs font-semibold px-6 py-3 rounded-md hover:bg-brand-blush-dark dark:hover:bg-brand-blush hover:text-white transition duration-300 uppercase tracking-widest"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand Info */}
          <div>
            <span className="font-serif text-2xl font-bold tracking-widest text-brand-charcoal dark:text-brand-cream">
              DRESIQ<span className="text-brand-blush-dark">.</span>
            </span>
            <p className="mt-4 text-xs leading-relaxed text-brand-charcoal/60 dark:text-brand-cream/60">
              A luxury boutique clothing line bringing you premium linen kurtas, authentic handwoven silk sarees, custom bridal lehengas, and contemporary western styles. Embodying grace, heritage, and modern chic.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-brand-charcoal/70 dark:text-brand-cream/70 hover:text-brand-blush-dark transition">
                <FiInstagram className="h-5 w-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-brand-charcoal/70 dark:text-brand-cream/70 hover:text-brand-blush-dark transition">
                <FiFacebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-brand-charcoal/70 dark:text-brand-cream/70 hover:text-brand-blush-dark transition">
                <FiTwitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          {user && (
            <div>
              <h4 className="font-serif text-sm font-bold uppercase tracking-wider mb-6">Bespoke Tailoring</h4>
              <ul className="space-y-3 text-xs text-brand-charcoal/70 dark:text-brand-cream/70">
                <li><Link to="/shop" className="hover:text-brand-blush-dark transition">Customize Kurti</Link></li>
                <li><Link to="/shop" className="hover:text-brand-blush-dark transition">Customize Anarkali</Link></li>
                <li><Link to="/shop" className="hover:text-brand-blush-dark transition">Customize Lehenga</Link></li>
                <li><Link to="/shop" className="hover:text-brand-blush-dark transition">Customize Dupatta</Link></li>
                <li><Link to="/shop" className="hover:text-brand-blush-dark transition">Customize Kurtaset</Link></li>
              </ul>
            </div>
          )}

          {/* Customer Service */}
          <div>
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider mb-6">Customer Service</h4>
            <ul className="space-y-3 text-xs text-brand-charcoal/70 dark:text-brand-cream/70">
              <li><Link to="/faq" className="hover:text-brand-blush-dark transition">FAQs & Help</Link></li>
              <li><Link to="/about" className="hover:text-brand-blush-dark transition">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-brand-blush-dark transition">Store Locations</Link></li>
              <li><a href="#shipping" className="hover:text-brand-blush-dark transition">Shipping & Returns</a></li>
              <li><a href="#privacy" className="hover:text-brand-blush-dark transition">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider mb-6">Contact Us</h4>
            <ul className="space-y-4 text-xs text-brand-charcoal/70 dark:text-brand-cream/70">
              <li className="flex items-start gap-3">
                <FiMapPin className="h-4 w-4 mt-0.5 text-brand-blush-dark flex-shrink-0" />
                <span>Madurai,TamilNadu</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="h-4 w-4 text-brand-blush-dark flex-shrink-0" />
                <span>+91 9381040369</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="h-4 w-4 text-brand-blush-dark flex-shrink-0" />
                <span>pavankode697@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-brand-beige/35 dark:bg-brand-charcoal/50 py-6 text-center text-xs text-brand-charcoal/50 dark:text-brand-cream/40">
        <p>&copy; {new Date().getFullYear()} DRESIQ. Crafted for premium elegance. All rights reserved.</p>
      </div>

    </footer>
  );
};
