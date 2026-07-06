import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { FiFilter, FiSliders } from 'react-icons/fi';

export const Shop: React.FC = () => {
  const { products, categories } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'All');
  const [sortOption, setSortOption] = useState<string>('default');
  const [selectedPrice, setSelectedPrice] = useState<number>(500);

  // Sync category state with search query param
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('All');
    }
  }, [categoryParam]);

  // Handle Category Filter
  const filteredProducts = products.filter(p => {
    const categoryMatch = selectedCategory === 'All' || p.category === selectedCategory;
    const priceMatch = (p.discountPrice || p.price) <= selectedPrice;
    const searchMatch = !searchParam || p.name.toLowerCase().includes(searchParam.toLowerCase()) || p.category.toLowerCase().includes(searchParam.toLowerCase());
    return categoryMatch && priceMatch && searchMatch;
  });

  // Handle Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;
    if (sortOption === 'price-low') return priceA - priceB;
    if (sortOption === 'price-high') return priceB - priceA;
    if (sortOption === 'rating') return b.rating - a.rating;
    return 0; // Default
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal dark:text-white">
          {searchParam ? `Search Results for "${searchParam}"` : `${selectedCategory} Collection`}
        </h1>
        <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mt-2 font-medium">
          Showing {sortedProducts.length} luxurious items
        </p>
      </div>

      {/* Main Grid: Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 bg-white dark:bg-brand-charcoal/20 p-6 rounded-2xl border border-brand-beige-dark/15 h-fit">
          <div className="flex items-center gap-2 border-b border-brand-beige-dark/10 pb-4 mb-6">
            <FiFilter className="text-brand-blush-dark" />
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider">Filter By</h3>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3">Categories</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchParams({});
                }}
                className={`w-full text-left text-xs py-1 transition ${selectedCategory === 'All' ? 'text-brand-blush-dark font-bold' : 'text-brand-charcoal/70 dark:text-brand-cream-light/70'}`}
              >
                All Collections
              </button>
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSearchParams({ category: cat });
                  }}
                  className={`w-full text-left text-xs py-1 transition ${selectedCategory === cat ? 'text-brand-blush-dark font-bold' : 'text-brand-charcoal/70 dark:text-brand-cream-light/70'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3">Price Limit</h4>
            <input
              type="range"
              min="20"
              max="500"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(Number(e.target.value))}
              className="w-full accent-brand-blush-dark"
            />
            <div className="flex justify-between text-[10px] text-brand-charcoal/50 dark:text-brand-cream/50 mt-1">
              <span>Min: ₹20</span>
              <span className="font-bold text-brand-blush-dark">Max: ₹{selectedPrice}</span>
            </div>
          </div>

          {/* Sorting */}
          <div>
            <div className="flex items-center gap-2 border-b border-brand-beige-dark/10 pb-3 mb-4">
              <FiSliders className="text-brand-blush-dark" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Sort By</h4>
            </div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
            >
              <option value="default">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating: High to Low</option>
            </select>
          </div>

        </div>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3">
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-brand-charcoal/20 border border-brand-beige-dark/15 rounded-2xl">
              <p className="text-sm text-brand-charcoal/60 dark:text-brand-cream/60">No luxury items match your criteria.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedPrice(500);
                  setSearchParams({});
                }}
                className="mt-4 text-xs font-bold text-brand-blush-dark uppercase tracking-wider hover:underline"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
