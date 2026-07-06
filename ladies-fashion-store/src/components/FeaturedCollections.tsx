import React from 'react';
import { useNavigate } from 'react-router-dom';

const collections = [
  {
    name: "Heritage Sarees",
    description: "Pure Silk & Zari Weaves",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
    category: "Sarees",
    gridArea: "lg:col-span-2 lg:row-span-1"
  },
  {
    name: "Luxury Gowns",
    description: "Premium Silk Chiffon",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80",
    category: "Lehangas",
    gridArea: "lg:col-span-1 lg:row-span-1"
  },
  {
    name: "Wedding Collection",
    description: "Intricately Embellished Bridal Wear",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80",
    category: "Cotton Wear",
    gridArea: "lg:col-span-1 lg:row-span-2"
  },
  {
    name: "Western Chic",
    description: "Summer Wrap Dresses & Maxis",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80",
    category: "Western Wear",
    gridArea: "lg:col-span-2 lg:row-span-1"
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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[280px]">
        {collections.map((col, idx) => (
          <div
            key={idx}
            onClick={() => handleCollectionClick(col.category)}
            className={`group relative overflow-hidden rounded-2xl shadow-sm border border-brand-beige-dark/15 cursor-pointer transition-all duration-500 ${col.gridArea}`}
          >

            {/* Background Zoom Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url(${col.image})` }}
            ></div>

            {/* Soft overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300"></div>

            {/* Collection copy */}
            <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col justify-end">
              <span className="text-[9px] uppercase font-bold tracking-widest text-brand-blush">
                {col.description}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold mt-2 tracking-wide">
                {col.name}
              </h3>
              <div className="overflow-hidden mt-3">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-brand-blush-dark transition-all duration-300 transform translate-y-8 group-hover:translate-y-0">
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
