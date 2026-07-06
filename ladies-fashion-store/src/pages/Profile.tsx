import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { toast } from 'react-toastify';

export const Profile: React.FC = () => {
  const { user, setUser } = useShop();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center px-4">
        <h2 className="font-serif text-2xl font-bold text-brand-charcoal dark:text-white">Access Denied</h2>
        <p className="text-xs text-brand-charcoal/60 mt-1">Please sign in to view your profile.</p>
        <button onClick={() => navigate('/login')} className="mt-6 bg-brand-charcoal text-white text-xs font-semibold px-8 py-3.5 rounded-lg">
          Sign In
        </button>
      </div>
    );
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ ...user, ...form });
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-brand-charcoal/20 p-8 rounded-2xl border border-brand-beige-dark/15 shadow-sm">
        
        <div className="border-b border-brand-beige-dark/10 pb-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white">My Profile</h1>
            <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mt-1">Manage your account information and default shipping addresses.</p>
          </div>
          <span className="bg-brand-blush text-brand-charcoal text-[9px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-md">
            {user.role} account
          </span>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                disabled
                value={form.email}
                className="w-full bg-brand-cream-light dark:bg-brand-charcoal/20 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/20 text-brand-charcoal/50 dark:text-brand-cream/50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Default Shipping Address</label>
            <input
              type="text"
              placeholder="Enter your street address, suite, city, state and zip code"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
            />
          </div>

          <button
            type="submit"
            className="bg-brand-charcoal text-white text-xs font-bold py-3.5 px-8 rounded-lg hover:bg-brand-blush-dark transition duration-300 uppercase tracking-widest"
          >
            Save Changes
          </button>
        </form>

      </div>
    </div>
  );
};
