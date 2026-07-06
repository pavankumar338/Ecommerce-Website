import React from 'react';
import { Link } from 'react-router-dom';
import { useShop, type Product } from '../context/ShopContext';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const isWishlisted = wishlist.includes(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    if (!isWishlisted) {
      toast.success(`${product.name} added to wishlist! 💖`);
    } else {
      toast.info(`${product.name} removed from wishlist.`);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Use first size and first color as default for quick-add
    const defaultSize = product.sizes[0] || 'S';
    const defaultColor = product.color[0] || 'Natural';
    addToCart(product.id, defaultSize, defaultColor, 1);
    toast.success(`${product.name} (${defaultSize} / ${defaultColor}) added to cart! 🛍️`);
  };

  // Calculate discount percentage
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="group relative bg-white dark:bg-brand-charcoal/20 rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-brand-beige-dark/15 hover:border-brand-blush-dark/30 transition-all duration-300 flex flex-col h-full">
      
      {/* Product Image and Overlay Actions */}
      <Link to={`/product/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-brand-cream-dark/10">
                {/* Main Product Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain object-center transition-all duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover Product Image Swap */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate`}
            className="absolute inset-0 w-full h-full object-contain object-center transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
            loading="lazy"
          />
        )}        {/* Badge Overlays */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.newArrival && (
            <span className="bg-brand-lavender text-brand-charcoal text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md shadow-xs">
              New
            </span>
          )}
          {product.bestSeller && (
            <span className="bg-brand-blush text-brand-charcoal text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md shadow-xs">
              Best Seller
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-red-150 text-red-600 text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 bg-white/70 hover:bg-white dark:bg-brand-charcoal/70 dark:hover:bg-brand-charcoal text-brand-charcoal dark:text-brand-cream p-2.5 rounded-full shadow-xs hover:shadow-md transition-all duration-300 z-10"
          aria-label="Add to wishlist"
        >
          <FiHeart
            className={`h-4.5 w-4.5 transition-colors duration-300 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-brand-charcoal dark:text-brand-cream'}`}
          />
        </button>

        {/* Quick Add To Cart Hover Overlay */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10 hidden sm:block">
          <button
            onClick={handleQuickAdd}
            className="w-full bg-brand-charcoal/90 hover:bg-brand-charcoal dark:bg-brand-cream dark:hover:bg-brand-cream-light text-white dark:text-brand-charcoal text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition duration-300 uppercase tracking-widest"
          >
            <FiShoppingBag className="h-4 w-4" />
            Quick Add
          </button>
        </div>

      </Link>

      {/* Product Details Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category info */}
          <div className="flex items-center justify-between text-[10px] text-brand-charcoal/40 dark:text-brand-cream/40 uppercase tracking-wider font-medium">
            <span>{product.brand}</span>
            <span>{product.category}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-sm font-bold text-brand-charcoal dark:text-white mt-2 group-hover:text-brand-blush-dark transition line-clamp-1">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>

          {/* Review Ratings */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex text-brand-gold text-xs">
              <FiStar className="fill-current" />
            </div>
            <span className="text-[10px] font-bold text-brand-charcoal/60 dark:text-brand-cream/60">
              {product.rating} <span className="font-light">({product.reviews.length})</span>
            </span>
          </div>
        </div>

        {/* Product Price & Mobile CTA Button */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {product.discountPrice ? (
              <>
                <span className="text-sm font-bold text-brand-charcoal dark:text-white">
                  ₹{product.discountPrice}
                </span>
                <span className="text-xs text-brand-charcoal/45 dark:text-brand-cream/45 line-through">
                  ₹{product.price}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-brand-charcoal dark:text-white">
                ₹{product.price}
              </span>
            )}
          </div>

          {/* Mobile Only Cart Button */}
          <button
            onClick={handleQuickAdd}
            className="sm:hidden bg-brand-charcoal dark:bg-brand-cream text-white dark:text-brand-charcoal p-2 rounded-lg hover:bg-brand-blush-dark dark:hover:bg-brand-blush transition"
            aria-label="Add to cart"
          >
            <FiShoppingBag className="h-4.5 w-4.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
