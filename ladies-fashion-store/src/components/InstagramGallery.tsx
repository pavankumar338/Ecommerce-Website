import React from 'react';

const instagramPosts = [
  "/dupatta.png",
  "/lehenga.png",
  "/kurtaset.png",
  "/OfficeWearKurti.png",
  "/shortkurtis.png",
  "/anarkalis.png"
];

export const InstagramGallery: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Header Info */}
      <div className="text-center mb-16">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2 text-brand-charcoal dark:text-white">Gallery</h2>
        <div className="h-0.5 w-16 bg-brand-blush-dark mx-auto mt-4"></div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {instagramPosts.map((post, idx) => (
          <div
            key={idx}
            className="group relative block aspect-[3/4] rounded-2xl overflow-hidden shadow-xs border border-brand-beige-dark/15"
          >

            {/* Background Image */}
            <img
              src={post}
              alt={`Gallery feature look ${idx + 1}`}
              className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />

          </div>
        ))}
      </div>

    </section>
  );
};
