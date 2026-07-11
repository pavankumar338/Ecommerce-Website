import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { toast } from 'react-toastify';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const Checkout: React.FC = () => {
  const { cart, getDiscountedTotal, placeOrder, user, authLoading } = useShop();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United States'
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold">Your Bag is Empty</h2>
        <p className="text-xs text-brand-charcoal/50 mt-1">Please add items to your cart before checking out.</p>
        <button onClick={() => navigate('/shop')} className="mt-6 inline-block bg-brand-charcoal text-white text-xs font-semibold px-8 py-3 rounded-lg">
          Explore Shop
        </button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address) {
      toast.error("Please fill in all shipping details.");
      return;
    }

    if (paymentMethod === 'Razorpay') {
      setIsSubmitting(true);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
        setIsSubmitting(false);
        return;
      }

      const totalAmount = getDiscountedTotal();
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dresiqPaymentKey',
        amount: totalAmount * 100, // Amount in paise
        currency: 'INR',
        name: 'Dresiq',
        description: 'Catalog Products Purchase',
        image: '/favicon.svg',
        handler: async function (response: any) {
          try {
            const order = await placeOrder(form, 'Razorpay');
            setIsSubmitting(false);
            if (order) {
              toast.success(`Order Placed Successfully! Payment ID: ${response.razorpay_payment_id} 🎉`);
              navigate(`/order-success?orderId=${order.id}`);
            } else {
              toast.error("Failed to store order after payment.");
            }
          } catch (err) {
            setIsSubmitting(false);
            toast.error("Error creating order.");
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone
        },
        theme: {
          color: '#C5A880'
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
            toast.warning("Payment cancelled by user.");
          }
        }
      };

      try {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err) {
        setIsSubmitting(false);
        toast.error("An error occurred while opening the payment gateway.");
      }
    } else {
      // Cash on Delivery
      setIsSubmitting(true);
      const order = await placeOrder(form, paymentMethod);
      setIsSubmitting(false);
      if (order) {
        toast.success("Order Placed Successfully! 🎉");
        navigate(`/order-success?orderId=${order.id}`);
      } else {
        toast.error("Failed to place order.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="font-serif text-3xl font-bold text-brand-charcoal dark:text-white">Secure Checkout</h1>
        <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mt-1">Provide your delivery information and finalize purchase.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Shipping Form */}
        <div className="lg:col-span-2 bg-white dark:bg-brand-charcoal/20 p-8 rounded-2xl border border-brand-beige-dark/15 space-y-6">
          <h2 className="font-serif text-lg font-bold border-b border-brand-beige-dark/10 pb-4">Shipping Information</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleInputChange}
                className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleInputChange}
                className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={form.phone}
                onChange={handleInputChange}
                className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Country</label>
              <select
                name="country"
                value={form.country}
                onChange={handleInputChange}
                className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
              >
                <option value="United States">United States</option>
                <option value="India">India</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Street Address</label>
            <input
              type="text"
              name="address"
              required
              value={form.address}
              onChange={handleInputChange}
              className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">City</label>
              <input
                type="text"
                name="city"
                required
                value={form.city}
                onChange={handleInputChange}
                className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                required
                value={form.postalCode}
                onChange={handleInputChange}
                className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
              />
            </div>
          </div>

        </div>

        {/* Order Summary & Payment */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Payment Method Selector */}
          <div className="bg-white dark:bg-brand-charcoal/20 p-6 rounded-2xl border border-brand-beige-dark/15">
            <h2 className="font-serif text-sm font-bold uppercase tracking-wider mb-4 border-b border-brand-beige-dark/10 pb-3">Payment Method</h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-brand-beige-dark/20 cursor-pointer hover:border-brand-blush-dark transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="accent-brand-blush-dark"
                />
                <span className="text-xs font-semibold text-brand-charcoal dark:text-brand-cream">Cash On Delivery (COD)</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-brand-beige-dark/20 cursor-pointer hover:border-brand-blush-dark transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Razorpay"
                  checked={paymentMethod === 'Razorpay'}
                  onChange={() => setPaymentMethod('Razorpay')}
                  className="accent-brand-blush-dark"
                />
                <span className="text-xs font-semibold text-brand-charcoal dark:text-brand-cream">Online Payment (Razorpay)</span>
              </label>
            </div>
          </div>

          {/* Pricing calculations */}
          <div className="bg-white dark:bg-brand-charcoal/20 p-6 rounded-2xl border border-brand-beige-dark/15 space-y-4">
            <h2 className="font-serif text-sm font-bold uppercase tracking-wider border-b border-brand-beige-dark/10 pb-3">Order Total</h2>
            
            <div className="flex justify-between text-xs text-brand-charcoal/70 dark:text-brand-cream-light/70 font-semibold">
              <span>Grand Total</span>
              <span className="text-sm font-bold text-brand-charcoal dark:text-white">₹{getDiscountedTotal()}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-charcoal text-white text-xs font-bold py-4 rounded-xl hover:bg-brand-blush-dark transition duration-300 uppercase tracking-widest mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (paymentMethod === 'Razorpay' ? "Opening Razorpay..." : "Placing Order...") : "Pay & Place Order"}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};
