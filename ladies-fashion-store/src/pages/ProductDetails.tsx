import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { FiHeart, FiShoppingBag, FiStar, FiChevronLeft, FiPlus, FiMinus } from 'react-icons/fi';
import { toast } from 'react-toastify';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart, wishlist, toggleWishlist, addReview, addToRecentlyViewed, user, authLoading } = useShop();

  const product = products.find(p => p.id === Number(id));

  // State
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [reviewName, setReviewName] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0]);
      setSelectedSize(product.sizes[0] || '');
      setSelectedColor(product.color[0] || '');
      setQuantity(1);
      addToRecentlyViewed(product.id);
    }
  }, [id, product]);

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

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold">Product Not Found</h2>
        <button onClick={() => navigate('/shop')} className="mt-4 inline-block bg-brand-charcoal text-white text-xs font-semibold px-6 py-3 rounded-md">
          Back to Shop
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);

  const handleAddToCart = () => {
    addToCart(product.id, selectedSize, selectedColor, quantity);
    toast.success(`${product.name} added to cart! 🛍️`);
  };

  const handleBuyNow = () => {
    addToCart(product.id, selectedSize, selectedColor, quantity);
    navigate('/cart');
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product.id);
    if (!isWishlisted) {
      toast.success(`${product.name} added to wishlist! 💖`);
    } else {
      toast.info(`${product.name} removed from wishlist.`);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewComment.trim()) {
      addReview(product.id, reviewRating, reviewComment, reviewName || "Anonymous User");
      toast.success("Thank you! Your review has been submitted for approval.");
      setReviewComment('');
      setReviewName('');
      setReviewRating(5);
    }
  };

  // Magnifying Zoom Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center',
      transform: 'scale(1)'
    });
  };

  // Filter Related products (same category, excluding current product)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Back Link */}
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs text-brand-charcoal/60 dark:text-brand-cream/60 hover:text-brand-blush-dark transition mb-8 font-medium">
        <FiChevronLeft /> Back to previous page
      </button>

      {/* Main product view grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        
        {/* Images Column */}
        <div className="space-y-4">
          
          {/* Large display preview with zoom */}
          <div
            className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-brand-beige-dark/15 cursor-zoom-in bg-white"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={selectedImage}
              alt={product.name}
              style={zoomStyle}
              className="w-full h-full object-contain object-center transition-transform duration-100"
            />          </div>

          {/* Thumbnails Row */}
          <div className="flex gap-3 overflow-x-auto py-1">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-24 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${selectedImage === img ? 'border-brand-blush-dark' : 'border-brand-beige-dark/20'}`}
              >
                <img src={img} alt="Thumbnail view" className="w-full h-full object-contain object-center bg-brand-cream-dark/10" />
              </button>
            ))}
          </div>

        </div>

        {/* Details Column */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-brand-blush-dark uppercase tracking-widest">
              <span>{product.brand}</span>
              <span>{product.stock > 0 ? `${product.stock} items left` : 'Out of Stock'}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal dark:text-white mt-4 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Price */}
            <div className="flex items-center gap-6 mt-4 pb-6 border-b border-brand-beige-dark/10">
              <div className="flex items-center gap-1.5">
                <div className="flex text-brand-gold text-sm">
                  <FiStar className="fill-current" />
                </div>
                <span className="text-xs font-bold text-brand-charcoal/60 dark:text-brand-cream/60">
                  {product.rating} ({product.reviews.length} customer reviews)
                </span>
              </div>

              <div className="flex items-center gap-3">
                {product.discountPrice ? (
                  <>
                    <span className="text-2xl font-bold text-brand-charcoal dark:text-white">
                      ₹{product.discountPrice}
                    </span>
                    <span className="text-sm text-brand-charcoal/45 dark:text-brand-cream/45 line-through">
                      ₹{product.price}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-brand-charcoal dark:text-white">
                    ₹{product.price}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-brand-charcoal/70 dark:text-brand-cream-light/75 leading-relaxed font-light mt-6">
              {product.description}
            </p>

            {/* Color selection */}
            {product.color.length > 0 && (
              <div className="mt-8">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-3">Color: <span className="font-medium text-brand-charcoal/60 dark:text-brand-cream/60">{selectedColor}</span></h4>
                <div className="flex gap-2">
                  {product.color.map((col, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(col)}
                      className={`text-xs px-4 py-2 rounded-lg border font-medium transition ${selectedColor === col ? 'bg-brand-charcoal text-white border-brand-charcoal dark:bg-brand-cream dark:text-brand-charcoal dark:border-brand-cream' : 'border-brand-beige-dark/30 hover:border-brand-blush-dark'}`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes.length > 0 && product.sizes[0] !== "One Size" && (
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-3">Select Size: <span className="font-medium text-brand-charcoal/60 dark:text-brand-cream/60">{selectedSize}</span></h4>
                <div className="flex gap-2">
                  {product.sizes.map((sz, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(sz)}
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center text-xs font-semibold transition ${selectedSize === sz ? 'bg-brand-charcoal text-white border-brand-charcoal dark:bg-brand-cream dark:text-brand-charcoal dark:border-brand-cream' : 'border-brand-beige-dark/30 hover:border-brand-blush-dark'}`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-3">Quantity</h4>
                <div className="flex items-center border border-brand-beige-dark/35 w-fit rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-brand-blush-light dark:hover:bg-brand-charcoal/40 text-brand-charcoal dark:text-brand-cream transition"
                  >
                    <FiMinus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-5 text-xs font-semibold select-none">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 hover:bg-brand-blush-light dark:hover:bg-brand-charcoal/40 text-brand-charcoal dark:text-brand-cream transition"
                  >
                    <FiPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-8 border-t border-brand-beige-dark/10">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-brand-charcoal dark:bg-brand-cream text-white dark:text-brand-charcoal font-semibold uppercase tracking-widest text-xs py-4 rounded-xl flex items-center justify-center gap-2 shadow-xs hover:shadow-md hover:bg-brand-blush-dark dark:hover:bg-brand-blush hover:text-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingBag className="h-4.5 w-4.5" />
              Add to Bag
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 bg-brand-blush text-brand-charcoal font-semibold uppercase tracking-widest text-xs py-4 rounded-xl flex items-center justify-center shadow-xs hover:shadow-md hover:bg-brand-blush-dark hover:text-white transition duration-300 disabled:opacity-50"
            >
              Buy Now
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`p-4 rounded-xl border border-brand-beige-dark/35 flex items-center justify-center transition duration-300 ${isWishlisted ? 'bg-red-50 text-red-500 border-red-200' : 'hover:border-brand-blush-dark text-brand-charcoal dark:text-brand-cream'}`}
              aria-label="Add to wishlist"
            >
              <FiHeart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

        </div>

      </div>

      {/* Reviews Tab Section */}
      <section className="mb-20">
        <h3 className="font-serif text-xl font-bold border-b border-brand-beige-dark/10 pb-4 mb-6">
          Reviews ({product.reviews.length})
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div key={rev.id} className="bg-white dark:bg-brand-charcoal/15 p-6 rounded-2xl border border-brand-beige-dark/10">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xs font-bold text-brand-charcoal dark:text-white">{rev.userName}</span>
                    <span className="text-[10px] text-brand-charcoal/40 dark:text-brand-cream/40 font-medium">{rev.date}</span>
                  </div>
                  <div className="flex text-brand-gold text-xs gap-0.5 mt-1.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={`fill-current ${i < rev.rating ? 'text-brand-gold' : 'text-brand-beige'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-brand-charcoal/80 dark:text-brand-cream-light/80 leading-relaxed font-light">
                    {rev.comment}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50">Be the first to review this product!</p>
            )}
          </div>

          {/* Review form */}
          <div className="lg:col-span-1 bg-white dark:bg-brand-charcoal/20 p-6 rounded-2xl border border-brand-beige-dark/15">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider mb-4 border-b border-brand-beige-dark/10 pb-3">Write a Review</h4>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aditi Sharma"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                >
                  <option value="5">5 Stars (Excellent)</option>
                  <option value="4">4 Stars (Good)</option>
                  <option value="3">3 Stars (Average)</option>
                  <option value="2">2 Stars (Poor)</option>
                  <option value="1">1 Star (Very Poor)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Review Comment</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your experience with this item..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-charcoal text-white text-xs font-semibold py-3 rounded-lg hover:bg-brand-blush-dark hover:text-white transition duration-300 uppercase tracking-widest"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section>
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold tracking-widest text-brand-blush-dark uppercase">You May Also Like</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold mt-2 text-brand-charcoal dark:text-white">Related Products</h3>
            <div className="h-0.5 w-16 bg-brand-blush-dark mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
