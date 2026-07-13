import React from 'react';
import { Link } from 'react-router-dom';
import { type Product } from '../context/ShopContext';
import { FiStar } from 'react-icons/fi';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
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
        )}
        
        {/* Badge Overlays */}
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

        {/* Product Price */}
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
        </div>

      </div>

    </div>
  );
};
