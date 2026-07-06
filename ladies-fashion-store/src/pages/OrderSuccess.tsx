import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

export const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId') || 'ORD-998812';

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="bg-white dark:bg-brand-charcoal/20 p-8 rounded-2xl border border-brand-beige-dark/15 shadow-sm">
        <div className="flex justify-center text-brand-blush-dark text-6xl mb-6">
          <FiCheckCircle className="animate-bounce" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-brand-charcoal dark:text-white">Thank You!</h1>
        <p className="text-xs text-brand-charcoal/60 dark:text-brand-cream/60 mt-3 font-medium">Your purchase was successful.</p>
        
        <div className="bg-brand-cream-light dark:bg-brand-charcoal/40 p-4 rounded-xl border border-brand-beige-dark/10 my-6">
          <span className="text-[10px] text-brand-charcoal/50 dark:text-brand-cream/50 uppercase font-semibold">Order ID</span>
          <p className="text-sm font-bold text-brand-charcoal dark:text-white mt-1 tracking-wider">{orderId}</p>
        </div>

        <p className="text-[11px] text-brand-charcoal/50 dark:text-brand-cream/50 leading-relaxed font-light">
          A confirmation email has been dispatched with invoice details. Your premium clothes will arrive shortly!
        </p>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-brand-charcoal text-white text-xs font-semibold py-3.5 rounded-lg hover:bg-brand-blush-dark transition uppercase tracking-widest"
          >
            Track Order
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="w-full border border-brand-charcoal/30 text-brand-charcoal dark:text-brand-cream text-xs font-semibold py-3.5 rounded-lg hover:bg-brand-charcoal hover:text-white transition uppercase tracking-widest"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
