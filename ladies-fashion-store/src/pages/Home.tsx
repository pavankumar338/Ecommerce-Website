import React from 'react';
import { useShop } from '../context/ShopContext';
import { Hero } from '../components/Hero';
import { FeaturedCollections } from '../components/FeaturedCollections';
import { ProductCard } from '../components/ProductCard';
import { Reviews } from '../components/Reviews';
import { InstagramGallery } from '../components/InstagramGallery';

export const Home: React.FC = () => {
  const { products } = useShop();

  const trendingProducts = products.filter(p => p.trending).slice(0, 4);
  const newArrivals = products.filter(p => p.newArrival).slice(0, 4);

  return (
    <div className="w-full">
      {/* Hero Banner Slideshow */}
      <Hero />

      {/* Categories / Collections Grid */}
      <FeaturedCollections />


      {/* Trending Dresses Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold tracking-widest text-brand-blush-dark uppercase">Trending Collection</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2 text-brand-charcoal dark:text-white">Trending Now</h2>
          <div className="h-0.5 w-16 bg-brand-blush-dark mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {trendingProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promotional Callout Banner */}
      <section className="relative py-24 bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1600')` }}>
        <div className="absolute inset-0 bg-brand-charcoal/45 dark:bg-black/60 backdrop-blur-[2px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white z-10">
          <span className="text-[10px] font-bold tracking-widest text-brand-blush uppercase bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">Premium Bridal Wear</span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mt-6 tracking-wide leading-tight max-w-2xl mx-auto">The Luxury Wedding Collection</h2>
          <p className="text-sm font-light mt-4 max-w-lg mx-auto opacity-90 leading-relaxed">
            Discover exquisite handcrafted lehengas, silk organza duppatas, and traditional gold zari weaves custom made to highlight your grace.
          </p>
          <div className="mt-8">
            <a
              href="/shop?category=Wedding Collection"
              className="inline-block bg-white text-brand-charcoal text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-md hover:bg-brand-blush hover:text-white transition duration-300 shadow-lg"
            >
              Collections
            </a>
          </div>
        </div>
      </section>

      {/* New Arrivals Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold tracking-widest text-brand-blush-dark uppercase">Fresh Out Of The Loom</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2 text-brand-charcoal dark:text-white">New Arrivals</h2>
          <div className="h-0.5 w-16 bg-brand-blush-dark mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Testimonials section */}
      <Reviews />

      {/* Instagram Gallery social wall */}
      <InstagramGallery />
    </div>
  );
};
