import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { toast } from 'react-toastify';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            phone: form.phone,
            role: form.email.toLowerCase() === 'admin@viora.com' ? 'admin' : 'user'
          }
        }
      });

      if (error) throw error;

      toast.success("Account created successfully! Please sign in. ✨");
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white dark:bg-brand-charcoal/20 p-8 rounded-2xl border border-brand-beige-dark/15 shadow-sm">
        
        <div className="text-center mb-8">
          <span className="font-serif text-3xl font-bold tracking-widest text-brand-charcoal dark:text-white">
            VIORA<span className="text-brand-blush-dark">.</span>
          </span>
          <h2 className="text-xs uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 tracking-wider mt-4">Create Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Aditi Sharma"
              value={form.name}
              onChange={handleInputChange}
              className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="aditi@viora.com"
              value={form.email}
              onChange={handleInputChange}
              className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={handleInputChange}
              className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={handleInputChange}
              className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleInputChange}
              className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-charcoal text-white text-xs font-bold py-3.5 rounded-lg hover:bg-brand-blush-dark transition duration-300 uppercase tracking-widest mt-2 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-xs text-brand-charcoal/60 dark:text-brand-cream/60 mt-8 font-medium">
          Already have an account? <Link to="/login" className="text-brand-blush-dark font-bold hover:underline">Sign In</Link>
        </p>

      </div>
    </div>
  );
};
