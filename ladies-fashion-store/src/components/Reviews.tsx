import React from 'react';
import { FiStar } from 'react-icons/fi';

const testimonials = [
  {
    name: "Sanjana",
    role: "Verified Buyer",
    rating: 5,
    text: "The Ethereal Rose Silk Saree surpassed all my expectations. The zari threads are incredibly soft and the drape of the silk feels so luxurious. Viora is my new go-to boutique!",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
  },
  {
    name: "Pooja ",
    role: "Fashion Consultant",
    rating: 5,
    text: "I recommended the organza wedding lehenga to one of my brides. The craftsmanship, sequins, and detailing were immaculate. Elegant pastel tones are exactly what modern brides need.",
    avatar: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=100&auto=format&fit=crop&q=80"
  },
  {
    name: "Akshaya",
    role: "Verified Buyer",
    rating: 5,
    text: "Minimalist, luxury office blazers that feel tailored and elegant. The premium fabric keeps its silhouette all day. Excellent concierge customer support as well.",
    avatar: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&auto=format&fit=crop&q=80"
  }
];

export const Reviews: React.FC = () => {
  return (
    <section className="bg-brand-cream-light dark:bg-brand-charcoal/10 py-20 px-4 sm:px-6 lg:px-8 border-t border-brand-beige-dark/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Header Info */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold tracking-widest text-brand-blush-dark uppercase">Client Testimonials</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2 text-brand-charcoal dark:text-white">What Our Clients Say</h2>
          <div className="h-0.5 w-16 bg-brand-blush-dark mx-auto mt-4"></div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-brand-charcoal/20 p-8 rounded-2xl border border-brand-beige-dark/15 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Rating stars */}
                <div className="flex text-brand-gold text-sm gap-1 mb-4">
                  {[...Array(test.rating)].map((_, i) => (
                    <FiStar key={i} className="fill-current" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-xs italic leading-relaxed text-brand-charcoal/70 dark:text-brand-cream-light/70 font-light">
                  "{test.text}"
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-brand-beige-dark/10">
                <img src={test.avatar} alt={test.name} className="w-10 h-10 rounded-full object-cover border border-brand-blush-dark/30" />
                <div>
                  <h4 className="font-serif text-xs font-bold text-brand-charcoal dark:text-white">{test.name}</h4>
                  <span className="text-[9px] font-semibold text-brand-charcoal/40 dark:text-brand-cream/40 uppercase tracking-wider">{test.role}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
