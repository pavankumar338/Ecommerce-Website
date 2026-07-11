import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

export const FlashSale: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useShop();
  // Target: 3 days from now
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 12,
    minutes: 45,
    seconds: 0
  });

  useEffect(() => {
    // Initialize end time in localStorage or calculate fresh target
    const targetTime = Date.now() + (3 * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000);
    
    const interval = setInterval(() => {
      const difference = targetTime - Date.now();
      
      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  return (
    <section className="bg-brand-blush dark:bg-brand-charcoal/20 py-12 px-4 sm:px-6 lg:px-8 border-y border-brand-blush-dark/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Promotion Copy */}
        <div className="text-center lg:text-left">
          <span className="text-[10px] font-bold tracking-widest text-brand-blush-dark bg-white dark:bg-brand-charcoal px-3 py-1 rounded-full uppercase shadow-xs">
            Limited Time Offer
          </span>
          <h2 className="font-serif text-3xl font-bold mt-4 text-brand-charcoal dark:text-white">
            Midsummer Soirée Sale
          </h2>
          <p className="text-xs text-brand-charcoal/60 dark:text-brand-cream/60 mt-2 max-w-md">
            Elevate your wardrobe with premium ethnic ensembles and luxury gowns. Apply coupon <span className="font-bold text-brand-charcoal dark:text-brand-cream">SUMMER15</span> at checkout.
          </p>
        </div>

        {/* Countdown Timer Display */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="bg-white dark:bg-brand-charcoal w-16 h-16 rounded-lg flex items-center justify-center shadow-sm border border-brand-beige-dark/20">
              <span className="text-xl sm:text-2xl font-semibold text-brand-charcoal dark:text-brand-cream">{formatNumber(timeLeft.days)}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-brand-charcoal/40 dark:text-brand-cream/40 mt-1">Days</span>
          </div>
          
          <span className="text-xl font-bold text-brand-blush-dark">:</span>

          <div className="flex flex-col items-center">
            <div className="bg-white dark:bg-brand-charcoal w-16 h-16 rounded-lg flex items-center justify-center shadow-sm border border-brand-beige-dark/20">
              <span className="text-xl sm:text-2xl font-semibold text-brand-charcoal dark:text-brand-cream">{formatNumber(timeLeft.hours)}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-brand-charcoal/40 dark:text-brand-cream/40 mt-1">Hrs</span>
          </div>

          <span className="text-xl font-bold text-brand-blush-dark">:</span>

          <div className="flex flex-col items-center">
            <div className="bg-white dark:bg-brand-charcoal w-16 h-16 rounded-lg flex items-center justify-center shadow-sm border border-brand-beige-dark/20">
              <span className="text-xl sm:text-2xl font-semibold text-brand-charcoal dark:text-brand-cream">{formatNumber(timeLeft.minutes)}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-brand-charcoal/40 dark:text-brand-cream/40 mt-1">Mins</span>
          </div>

          <span className="text-xl font-bold text-brand-blush-dark">:</span>

          <div className="flex flex-col items-center">
            <div className="bg-white dark:bg-brand-charcoal w-16 h-16 rounded-lg flex items-center justify-center shadow-sm border border-brand-beige-dark/20">
              <span className="text-xl sm:text-2xl font-semibold text-brand-blush-dark">{formatNumber(timeLeft.seconds)}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-brand-charcoal/40 dark:text-brand-cream/40 mt-1">Secs</span>
          </div>
        </div>

        {/* CTA Shop Button */}
        <div>
          <button
            onClick={() => {
              if (user) {
                navigate('/shop');
              } else {
                navigate('/login');
              }
            }}
            className="bg-brand-charcoal dark:bg-brand-cream text-white dark:text-brand-charcoal text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-md hover:bg-brand-blush-dark dark:hover:bg-brand-blush hover:text-white transition duration-300 shadow-sm"
          >
            Claim 15% Off
          </button>
        </div>

      </div>
    </section>
  );
};
