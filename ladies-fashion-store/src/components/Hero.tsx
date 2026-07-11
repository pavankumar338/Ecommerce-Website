import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useShop } from '../context/ShopContext';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useShop();

  return (
    <div className="relative h-[650px] w-full flex items-center justify-center overflow-hidden bg-[#0A0A0A] text-white">
      {/* Subtle luxury glow effects in background */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-brand-gold/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-blush-dark/5 blur-[150px] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center z-10">
        <div className="max-w-3xl mx-auto">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal leading-[1.1] tracking-wide text-white"
          >
            Design Your Perfect <br className="hidden sm:inline" /> Outfit
          </motion.h1>

          {/* Subtitle / Description */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xs sm:text-sm md:text-base text-white/70 max-w-xl mx-auto mt-6 sm:mt-8 leading-relaxed font-light font-sans tracking-wide"
          >
            Customize your dress step by step or choose from our ready designs. We stitch it perfectly for you.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <button
              onClick={() => {
                if (user) {
                  navigate('/shop?view=customization');
                } else {
                  navigate('/login');
                }
              }}
              className="w-full sm:w-auto bg-brand-gold hover:bg-white text-brand-charcoal font-sans text-xs sm:text-sm font-semibold tracking-widest uppercase px-8 py-4 rounded-md transition-all duration-300 shadow-lg shadow-brand-gold/10"
            >
              Start Customization
            </button>
            <button
              onClick={() => {
                if (user) {
                  navigate('/shop');
                } else {
                  navigate('/login');
                }
              }}
              className="w-full sm:w-auto border border-white/20 hover:border-white/60 text-white bg-white/5 hover:bg-white/10 transition-all duration-300 font-sans text-xs sm:text-sm font-semibold tracking-widest uppercase px-8 py-4 rounded-md"
            >
              Select Design
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

