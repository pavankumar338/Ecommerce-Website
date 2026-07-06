import React from 'react';

export const AboutUs: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-16 text-center">
        <span className="text-[10px] font-bold tracking-widest text-brand-blush-dark uppercase">Our Heritage</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2 text-brand-charcoal dark:text-white">Our Story & Ethos</h1>
        <div className="h-0.5 w-16 bg-brand-blush-dark mx-auto mt-4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
        <div>
          <h2 className="font-serif text-2xl font-bold text-brand-charcoal dark:text-white mb-6">Born from Passion, Woven with Patience</h2>
          <p className="text-xs sm:text-sm text-brand-charcoal/70 dark:text-brand-cream-light/75 leading-relaxed font-light mb-4">
            Founded in 2020, VIORA started with a simple vision: to celebrate the timeless elegance of traditional Indian weaves while infusing them with contemporary Western cuts. We wanted to create clothes that feel like poetry, drape like a dream, and carry the weight of stories told by master artisans.
          </p>
          <p className="text-xs sm:text-sm text-brand-charcoal/70 dark:text-brand-cream-light/75 leading-relaxed font-light">
            Every thread of silk, every dye of blush pink and lavender, and every bead of pearl is selected with absolute dedication to premium luxury. We do not believe in fast-paced trends. We believe in pieces that live through generations.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-sm aspect-[4/3] bg-brand-cream-dark/10">
          <img src="https://images.unsplash.com/photo-1608748010899-18f300247112?w=800" alt="Weaving loom heritage" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="bg-brand-blush dark:bg-brand-charcoal/10 rounded-2xl p-8 lg:p-12 border border-brand-blush-dark/10 text-center max-w-4xl mx-auto">
        <h3 className="font-serif text-xl font-bold text-brand-charcoal dark:text-white">Our Ethical Commitment</h3>
        <p className="text-xs text-brand-charcoal/70 dark:text-brand-cream-light/70 mt-4 leading-relaxed font-light max-w-2xl mx-auto">
          We work directly with weaver cooperatives across Benaras, Kanchipuram, and Bhagalpur. By bypassing intermediaries, we ensure our artisans receive fair wages that celebrate their mastery. Over 60% of our weavers are women, and we are proud to support their economic independence.
        </p>
      </div>

    </div>
  );
};
