import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const slides = [
  {
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1600&auto=format&fit=crop&q=80",
    title: "Chic Pastel Grace",
    subtitle: "Summer Western Collection",
    description: "Embrace the soft warmth of summer with our delicate linens, light chiffon layers, and handpicked pastel wrap dresses.",
    cta: "Explore Styles",
    link: "/shop?category=Western Wear"
  },
  {
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80",
    title: "Heritage Handwoven Silk",
    subtitle: "Authentic Saree Collection",
    description: "Woven with patience and premium zari, experience the regal weight of traditional Banarasi and Kanjeevaram craftsmanship.",
    cta: "View Heritage",
    link: "/shop?category=Sarees"
  },
  {
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&auto=format&fit=crop&q=80",
    title: "Bridal Opulence",
    subtitle: "Wedding Collection 2026",
    description: "Intricately embellished with silver hand-embroidery, ivory pearls, and delicate organza layers designed for your special day.",
    cta: "Discover Bridal",
    link: "/shop?category=Wedding Collection"
  }
];

export const Hero: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative h-[650px] w-full overflow-hidden bg-brand-cream-light dark:bg-black">
      
      {/* Slides Background Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0.7, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.7 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slides[current].image})` }}
        >
          {/* Elegant Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-cream/80 via-brand-cream/20 to-black/10 dark:from-brand-charcoal/80 dark:via-brand-charcoal/30 dark:to-black/30"></div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Text Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl md:max-w-2xl">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <span className="text-xs font-bold uppercase tracking-widest text-brand-blush-dark bg-brand-blush/80 dark:bg-brand-blush-dark/15 px-3.5 py-1.5 rounded-full">
                  {slides[current].subtitle}
                </span>
                
                <h1 className="font-serif text-4xl sm:text-6xl font-bold text-brand-charcoal dark:text-white mt-6 leading-tight">
                  {slides[current].title}
                </h1>
                
                <p className="text-sm sm:text-base text-brand-charcoal/70 dark:text-brand-cream-light/80 mt-4 leading-relaxed font-light">
                  {slides[current].description}
                </p>
                
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => navigate(slides[current].link)}
                    className="bg-brand-charcoal dark:bg-brand-cream text-white dark:text-brand-charcoal text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded-full hover:bg-brand-blush-dark dark:hover:bg-brand-blush hover:text-white transition duration-300 shadow-md hover:shadow-lg"
                  >
                    Shop Now
                  </button>
                  <button
                    onClick={() => navigate('/shop')}
                    className="border border-brand-charcoal/35 dark:border-brand-cream/35 text-brand-charcoal dark:text-brand-cream hover:bg-brand-charcoal hover:text-white dark:hover:bg-brand-cream dark:hover:text-brand-charcoal text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded-full transition duration-300"
                  >
                    View All
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* Slide Navigation Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/45 dark:bg-black/20 dark:hover:bg-black/45 p-3 rounded-full text-brand-charcoal dark:text-brand-cream transition z-10 hidden md:block"
        aria-label="Previous slide"
      >
        <FiChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/45 dark:bg-black/20 dark:hover:bg-black/45 p-3 rounded-full text-brand-charcoal dark:text-brand-cream transition z-10 hidden md:block"
        aria-label="Next slide"
      >
        <FiChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-300 ${current === index ? 'w-8 bg-brand-blush-dark' : 'w-2 bg-brand-charcoal/30 dark:bg-brand-cream/30'}`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>

    </div>
  );
};
