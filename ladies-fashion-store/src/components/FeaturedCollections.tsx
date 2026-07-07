import React from 'react';
import { useNavigate } from 'react-router-dom';

const collections = [
  {
    name: "Anarkalis",
    description: "Elegant Anarkali Sets",
    image: "/anarkalis.png",
    category: "Sarees"
  },
  {
    name: "Dupatta",
    description: "Luxury Handwoven Dupattas",
    image: "/dupatta.png",
    category: "Lehangas"
  },
  {
    name: "Kurti",
    description: "Linen & Cotton Kurtis",
    image: "/kurtis.png",
    category: "Cotton Wear"
  },
  {
    name: "Lehenga",
    description: "Bridal & Festive Lehengas",
    image: "/lehenga.png",
    category: "Western Wear"
  }
];

export const FeaturedCollections: React.FC = () => {
  const navigate = useNavigate();

  const handleCollectionClick = (categoryName: string) => {
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Header Info */}
      <div className="text-center mb-16">
        <span className="text-[10px] font-bold tracking-widest text-brand-blush-dark uppercase">Curated For Elegance</span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2 text-brand-charcoal dark:text-white">Featured Collections</h2>
        <div className="h-0.5 w-16 bg-brand-blush-dark mx-auto mt-4"></div>
      </div>

      {/* Grid Layout - 2 columns on mobile/tablet, 4 columns on desktop for perfect portrait aspect ratio */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {collections.map((col, idx) => (
          <div
            key={idx}
            onClick={() => handleCollectionClick(col.category)}
            className="group relative overflow-hidden rounded-2xl shadow-sm border border-brand-beige-dark/15 cursor-pointer transition-all duration-500 h-[280px] sm:h-[380px] lg:h-[440px]"
          >

            {/* Background Zoom Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url(${col.image})` }}
            ></div>

            {/* Soft overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300"></div>

            {/* Collection copy */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white flex flex-col justify-end">
              <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-widest text-brand-blush">
                {col.description}
              </span>
              <h3 className="font-serif text-base sm:text-xl font-bold mt-1 sm:mt-2 tracking-wide leading-tight">
                {col.name}
              </h3>
              <div className="overflow-hidden mt-2 sm:mt-3">
                <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest text-brand-blush-dark transition-all duration-300 transform translate-y-8 group-hover:translate-y-0">
                  Shop Collection &rarr;
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
};
