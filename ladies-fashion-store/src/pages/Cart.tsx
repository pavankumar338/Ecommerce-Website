import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';

export const Cart: React.FC = () => {
  const { 
    cart, products, updateCartQuantity, removeFromCart, 
    getCartTotal, getDiscountedTotal, activeCoupon, applyCoupon, removeCoupon 
  } = useShop();

  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');

  const cartItemsData = cart.map(item => {
    const product = products.find(p => p.id === item.productId)!;
    return {
      ...item,
      product
    };
  });

  const handleCouponApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      const res = applyCoupon(couponCode);
      if (res.success) {
        toast.success(res.message);
        setCouponCode('');
      } else {
        toast.error(res.message);
      }
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.info("Coupon removed.");
  };

  const cartTotal = getCartTotal();
  const finalTotal = getDiscountedTotal();
  const discountAmount = cartTotal - finalTotal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="font-serif text-3xl font-bold text-brand-charcoal dark:text-white">Shopping Bag</h1>
        <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mt-1">
          Review your items and proceed to secure checkout.
        </p>
      </div>

      {cartItemsData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            {cartItemsData.map((item) => (
              <div 
                key={item.id} 
                className="bg-white dark:bg-brand-charcoal/20 p-5 rounded-2xl border border-brand-beige-dark/15 flex gap-5 items-center justify-between"
              >
                {/* Product image */}
                <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-brand-cream-dark/10">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain object-center bg-brand-cream-dark/5" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-brand-blush-dark uppercase font-bold tracking-widest">{item.product.brand}</span>
                  <h3 className="text-xs sm:text-sm font-bold text-brand-charcoal dark:text-white truncate mt-1">
                    {item.product.name}
                  </h3>
                  <p className="text-[10px] text-brand-charcoal/55 dark:text-brand-cream/55 mt-1.5 font-semibold">
                    Size: <span className="font-light">{item.selectedSize}</span> | Color: <span className="font-light">{item.selectedColor}</span>
                  </p>
                  
                  {/* Quantity adjustment */}
                  <div className="flex items-center border border-brand-beige-dark/25 w-fit rounded-lg overflow-hidden mt-3">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 hover:bg-brand-blush-light dark:hover:bg-brand-charcoal/40 text-brand-charcoal dark:text-brand-cream"
                    >
                      <FiMinus className="h-3 w-3" />
                    </button>
                    <span className="px-4 text-xs font-semibold select-none">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 hover:bg-brand-blush-light dark:hover:bg-brand-charcoal/40 text-brand-charcoal dark:text-brand-cream"
                    >
                      <FiPlus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Price and Delete */}
                <div className="text-right flex flex-col justify-between h-24">
                  <button
                    onClick={() => {
                      removeFromCart(item.id);
                      toast.info(`${item.product.name} removed from bag.`);
                    }}
                    className="text-brand-charcoal/40 dark:text-brand-cream/40 hover:text-red-500 self-end p-1 transition"
                    aria-label="Remove item"
                  >
                    <FiTrash2 className="h-4.5 w-4.5" />
                  </button>

                  <div className="text-sm font-bold text-brand-charcoal dark:text-white">
                    ₹{(item.product.discountPrice || item.product.price) * item.quantity}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Cart Summary Side Block */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Coupon Code Entry */}
            <div className="bg-white dark:bg-brand-charcoal/20 p-6 rounded-2xl border border-brand-beige-dark/15">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider mb-4 border-b border-brand-beige-dark/10 pb-3">Apply Coupon</h3>
              {activeCoupon ? (
                <div className="flex items-center justify-between bg-brand-blush/60 dark:bg-brand-blush-dark/10 p-3 rounded-lg border border-brand-blush-dark/30">
                  <div>
                    <p className="text-xs font-bold text-brand-charcoal dark:text-brand-cream">{activeCoupon.code}</p>
                    <p className="text-[10px] text-brand-blush-dark font-medium">Applied successfully</p>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
              ) : (
                <form onSubmit={handleCouponApply} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream uppercase"
                  />
                  <button type="submit" className="bg-brand-charcoal text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-brand-blush-dark transition">
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="bg-white dark:bg-brand-charcoal/20 p-6 rounded-2xl border border-brand-beige-dark/15 space-y-4">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider border-b border-brand-beige-dark/10 pb-3">Order Summary</h3>
              
              <div className="flex justify-between text-xs font-medium text-brand-charcoal/70 dark:text-brand-cream-light/70">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs font-medium text-red-500">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-xs font-medium text-brand-charcoal/70 dark:text-brand-cream-light/70">
                <span>Shipping</span>
                <span className="text-brand-blush-dark font-bold">FREE</span>
              </div>

              <div className="h-0.5 bg-brand-beige-dark/10 my-4"></div>

              <div className="flex justify-between text-sm font-bold text-brand-charcoal dark:text-white">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-brand-charcoal text-white text-xs font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-blush-dark transition duration-300 uppercase tracking-widest mt-6"
              >
                Proceed to Checkout <FiArrowRight />
              </button>

            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-24 bg-white dark:bg-brand-charcoal/20 border border-brand-beige-dark/15 rounded-2xl max-w-md mx-auto">
          <div className="flex justify-center text-brand-blush-dark text-4xl mb-4">
            <FiShoppingBag />
          </div>
          <p className="text-sm text-brand-charcoal/60 dark:text-brand-cream/60">Your shopping bag is empty.</p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-6 bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-widest px-8 py-3.5 rounded-lg hover:bg-brand-blush-dark transition duration-300"
          >
            Discover Collections
          </button>
        </div>
      )}

    </div>
  );
};
