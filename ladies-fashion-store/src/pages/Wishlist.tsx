import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';

export const Wishlist: React.FC = () => {
  const { wishlist, products, user, authLoading } = useShop();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream-light dark:bg-black/90">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal dark:text-white">
          My Wishlist
        </h1>
        <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mt-2 font-medium">
          Your curation of premium fashion favorites
        </p>
        <div className="h-0.5 w-16 bg-brand-blush-dark mx-auto mt-4"></div>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlistedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white dark:bg-brand-charcoal/20 border border-brand-beige-dark/15 rounded-2xl max-w-md mx-auto">
          <p className="text-sm text-brand-charcoal/60 dark:text-brand-cream/60">Your wishlist is empty.</p>
          <p className="text-xs text-brand-charcoal/40 dark:text-brand-cream/40 mt-1.5">Add items while browsing to save them here.</p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-6 bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-widest px-8 py-3.5 rounded-lg hover:bg-brand-blush-dark transition duration-300"
          >
            Start Shopping
          </button>
        </div>
      )}

    </div>
  );
};
