import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { toast } from 'react-toastify';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast.success("Signed in successfully! Welcome back. ✨");
      if (email.toLowerCase() === 'admin@dresiq.com') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white dark:bg-brand-charcoal/20 p-8 rounded-2xl border border-brand-beige-dark/15 shadow-sm">
        
        <div className="text-center mb-8">
          <span className="font-serif text-3xl font-bold tracking-widest text-brand-charcoal dark:text-white">
            DRESIQ<span className="text-brand-blush-dark">.</span>
          </span>
          <h2 className="text-xs uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 tracking-wider mt-4">Welcome Back</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="concierge@dresiq.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50">Password</label>
              <a href="#forgot" className="text-[10px] text-brand-blush-dark font-semibold hover:underline">Forgot?</a>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-charcoal text-white text-xs font-bold py-3.5 rounded-lg hover:bg-brand-blush-dark transition duration-300 uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-brand-charcoal/60 dark:text-brand-cream/60 mt-8 font-medium">
          New to Dresiq? <Link to="/register" className="text-brand-blush-dark font-bold hover:underline">Create Account</Link>
        </p>

      </div>
    </div>
  );
};
