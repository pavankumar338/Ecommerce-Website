import React from 'react';
import { FiInstagram } from 'react-icons/fi';

const instagramPosts = [
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&auto=format&fit=crop&q=80"
];

export const InstagramGallery: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Info */}
      <div className="text-center mb-16">
        <span className="text-[10px] font-bold tracking-widest text-brand-blush-dark uppercase">Social Proof</span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2 text-brand-charcoal dark:text-white">Shop The Look</h2>
        <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mt-3 font-medium">Tag us on Instagram @VioraFashion to be featured in our gallery.</p>
        <div className="h-0.5 w-16 bg-brand-blush-dark mx-auto mt-4"></div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {instagramPosts.map((post, idx) => (
          <a
            key={idx}
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="group relative block aspect-square rounded-2xl overflow-hidden shadow-xs border border-brand-beige-dark/15"
          >
            
            {/* Background Image */}
            <img
              src={post}
              alt={`Instagram feature look ${idx + 1}`}
              className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Dark Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white/80 dark:bg-brand-charcoal/80 p-3 rounded-full text-brand-charcoal dark:text-brand-cream shadow-md">
                <FiInstagram className="h-5 w-5" />
              </div>
            </div>

          </a>
        ))}
      </div>

    </section>
  );
};
