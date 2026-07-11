import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { FiFilter, FiSliders, FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { supabase } from '../services/supabase';

// Design gallery images (Kurti showcase for design details)
const designImages = [
  '/Kurti/kurti1.png',
  '/Kurti/kurti2.png',
  '/Kurti/kurti3.png',
  '/Kurti/kurti4.png',
  '/Kurti/kurti5.png',
  '/Kurti/kurti6.png',
  '/Kurti/kurti7.png',
  '/Kurti/kurti8.png',
  '/Kurti/kurti9.png',
  '/Kurti/kurti10.png'
];

// Fabric option images (used to display Silk and Cotton print textures)
const fabricPrints = [
  { name: 'Traditional Print', image: '/cotton/cotton1.png' },
  { name: 'Floral Bloom', image: '/cotton/cotton2.png' },
  { name: 'Ethnic Weave', image: '/cotton/cotton3.png' },
  { name: 'Indigo Dream', image: '/cotton/cotton4.png' },
  { name: 'Royal Gold Motif', image: '/cotton/cotton5.png' },
  { name: 'Summer Breeze', image: '/cotton/cotton6.png' },
  { name: 'Vintage Ornament', image: '/cotton/cotton7.png' },
  { name: 'Festive Zari', image: '/cotton/cotton8.png' }
];

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

export const Shop: React.FC = () => {
  const { products, categories, user, authLoading } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const viewParam = searchParams.get('view');

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'All');
  const [sortOption, setSortOption] = useState<string>('default');
  const [selectedPrice, setSelectedPrice] = useState<number>(500);

  // Tab View Switcher (Select Design vs Customization)
  const [shopView, setShopView] = useState<'select-design' | 'customization'>(
    viewParam === 'customization' ? 'customization' : 'select-design'
  );

  // Customization Wizard States
  const [customStep, setCustomStep] = useState(1);
  const [dressType, setDressType] = useState('Kurti');
  const [fabric, setFabric] = useState('Cotton');
  const [fabricColor, setFabricColor] = useState('Traditional Print');
  const [pattern, setPattern] = useState('Solid Plain');

  // Design Gallery & Customization States
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  const [customInstructions, setCustomInstructions] = useState<string>('');

  // Reset active image index when dress type changes
  useEffect(() => {
    setActiveImgIndex(0);
  }, [dressType]);

  // Payment Form States
  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Config data
  const dressTypes = [
    { name: 'Kurti', price: 120, image: '/kurtis.png', desc: 'Contemporary tunic style' },
    { name: 'Anarkali', price: 180, image: '/anarkalis.png', desc: 'Royal flared silhouette' },
    { name: 'Lehenga', price: 380, image: '/lehenga.png', desc: 'Bespoke bridal flared skirt set' },
    { name: 'Dupatta', price: 240, image: '/dupatta.png', desc: 'Classic 6-yard elegant drape' },
    { name: 'Kurtaset', price: 200, image: '/kurtaset.png', desc: 'Modern formal ethnic fusion' }
  ];

  const fabrics = [
    { name: 'Cotton', price: 0, desc: 'Breathable, daily luxury' },
    { name: 'Silk', price: 40, desc: 'Rich sheen, traditional royalty' }
  ];

  const patterns = [
    { name: 'Solid Plain', price: 0, desc: 'Minimalist solid theme' },
    { name: 'Floral Print', price: 10, desc: 'Charming nature prints' },
    { name: 'Hand Embroidery', price: 35, desc: 'Exquisite thread work' },
    { name: 'Zari Weaving', price: 50, desc: 'Regal gold thread motifs' }
  ];

  // Price Calculations
  const basePrice = dressTypes.find(d => d.name === dressType)?.price || 120;
  const fabricPrice = fabrics.find(f => f.name === fabric)?.price || 0;
  const patternPrice = patterns.find(p => p.name === pattern)?.price || 0;
  const totalPrice = dressType === 'Kurti' ? 2 : (basePrice + fabricPrice + patternPrice);
  const halfPrice = dressType === 'Kurti' ? 1 : (totalPrice / 2);

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
      setIsSubmitting(false);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dresiqPaymentKey', // Dummy/test key format fallback
      amount: halfPrice * 100, // Amount in paise
      currency: 'INR',
      name: 'Dresiq',
      description: `Bespoke Custom Tailoring Advance - ${dressType}`,
      image: '/favicon.svg',
      handler: async function (response: any) {
        try {
          const formattedPattern = `Design #${activeImgIndex + 1}`;

          const customOrder = {
            user_id: user?.id || null,
            customer_name: paymentForm.cardName,
            customer_email: paymentForm.email,
            customer_phone: paymentForm.phone,
            dress_type: dressType,
            fabric: fabric,
            fabric_color: fabricColor,
            pattern: formattedPattern,
            total_price: totalPrice,
            advance_paid: halfPrice,
            due_amount: halfPrice,
            razorpay_payment_id: response.razorpay_payment_id,
            payment_status: 'Paid (50% Advance)',
            status: 'Stitching'
          };

          const { error } = await supabase.from('custom_orders').insert(customOrder);

          if (error) {
            console.error("Database insert error:", error);
            toast.error("Payment successful, but failed to save order details. Please contact support.");
          } else {
            toast.success(`Custom order booked successfully! ID: ${response.razorpay_payment_id} ✂️`);
            setCustomStep(5);
          }
        } catch (err) {
          console.error("Order insertion error:", err);
          toast.error("An unexpected error occurred while saving your order.");
        } finally {
          setIsSubmitting(false);
        }
      },
      prefill: {
        name: paymentForm.cardName,
        email: paymentForm.email || 'customer@example.com',
        contact: paymentForm.phone || '9999999999'
      },
      theme: {
        color: '#C5A880'
      },
      modal: {
        ondismiss: function () {
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
  };

  // Sync category state with search query param
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('All');
    }
  }, [categoryParam]);

  // Sync view tab with query param
  useEffect(() => {
    if (viewParam === 'customization') {
      setShopView('customization');
    } else {
      setShopView('select-design');
    }
  }, [viewParam]);

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

      {/* View Switcher Header */}
      <div className="flex flex-col items-center mb-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal dark:text-white text-center">
          {shopView === 'customization' ? 'Bespoke Tailoring Studio' : (searchParam ? `Search Results for "${searchParam}"` : `${selectedCategory} Collection`)}
        </h1>
        <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mt-2 font-medium text-center">
          {shopView === 'customization' ? 'Stitch your dream outfit step by step' : `Showing ${sortedProducts.length} luxurious items`}
        </p>

        {/* View Switcher Tabs */}
        <div className="inline-flex bg-brand-cream dark:bg-brand-charcoal/40 p-1.5 rounded-xl border border-brand-beige-dark/20 shadow-xs mt-8">
          <button
            onClick={() => {
              setShopView('select-design');
              setSearchParams({});
            }}
            className={`px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${shopView === 'select-design' ? 'bg-brand-charcoal dark:bg-brand-cream text-white dark:text-brand-charcoal shadow-xs' : 'text-brand-charcoal/60 dark:text-brand-cream/60 hover:text-brand-charcoal dark:hover:text-brand-cream'}`}
          >
            Select Design
          </button>
          <button
            onClick={() => {
              setShopView('customization');
              setSearchParams({ view: 'customization' });
            }}
            className={`px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${shopView === 'customization' ? 'bg-brand-charcoal dark:bg-brand-cream text-white dark:text-brand-charcoal shadow-xs' : 'text-brand-charcoal/60 dark:text-brand-cream/60 hover:text-brand-charcoal dark:hover:text-brand-cream'}`}
          >
            Customization
          </button>
        </div>
      </div>

      {shopView === 'select-design' ? (
        /* ==================== SELECT DESIGN VIEW ==================== */
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
      ) : (
        /* ==================== CUSTOMIZATION WIZARD VIEW ==================== */
        <div className="bg-white dark:bg-brand-charcoal/20 p-4 sm:p-8 md:p-10 rounded-3xl border border-brand-beige-dark/15 shadow-sm max-w-6xl mx-auto w-full">

          {/* Horizontal Step Indicator */}
          <div className="flex justify-between items-center max-w-xl mx-auto mb-12">
            {[
              { step: 1, label: "Dress Type" },
              { step: 2, label: "Fabric" },
              { step: 3, label: "Designs" },
              { step: 4, label: "Half Payment" },
              { step: 5, label: "Full Dress" }
            ].map((s) => (
              <React.Fragment key={s.step}>
                <div className="flex flex-col items-center z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${customStep >= s.step ? 'bg-brand-blush-dark text-white' : 'bg-brand-cream-dark text-brand-charcoal/50 dark:text-brand-cream/50'}`}>
                    {s.step}
                  </div>
                  <span className={`text-[9px] uppercase font-bold tracking-wider mt-2 hidden sm:block ${customStep === s.step ? 'text-brand-blush-dark' : 'text-brand-charcoal/40 dark:text-brand-cream/40'}`}>
                    {s.label}
                  </span>
                </div>
                {s.step < 5 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${customStep > s.step ? 'bg-brand-blush-dark' : 'bg-brand-beige-dark/20'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="min-h-[350px]">
            {/* --- STEP 1: SELECT DRESS TYPE --- */}
            {customStep === 1 && (
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">1. Select Dress Type</h3>
                <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mb-8">Choose the base silhouette for your custom outfit.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                  {dressTypes.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => setDressType(item.name)}
                      className={`group overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-white dark:bg-brand-charcoal/20 flex flex-col justify-between h-[340px] ${dressType === item.name ? 'border-brand-gold bg-brand-gold/5 dark:bg-brand-gold/10 shadow-md' : 'border-brand-beige-dark/20 hover:border-brand-beige-dark/50'}`}
                    >
                      {/* Image Container */}
                      <div className="relative flex-1 overflow-hidden bg-brand-cream-dark/10">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                        {dressType === item.name && (
                          <div className="absolute top-3 right-3 bg-brand-gold text-brand-charcoal p-1.5 rounded-full shadow-md z-10">
                            <FiCheck className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      {/* Content Container */}
                      <div className="p-4 bg-transparent border-t border-brand-beige-dark/10 flex flex-col">
                        <h4 className="font-serif text-base font-bold text-brand-charcoal dark:text-white transition-colors duration-300 group-hover:text-brand-gold">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-brand-charcoal/60 dark:text-brand-cream/60 mt-1 font-light leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- STEP 2: FABRIC SELECTION --- */}
            {customStep === 2 && (
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">2. Cloth & Fabric Selection</h3>
                <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mb-8">Choose your premium material type and visual print texture.</p>

                {/* Fabric Selector */}
                <h4 className="text-xs uppercase font-bold tracking-wider mb-4 text-brand-blush-dark">Choose Fabric Type</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mb-8">
                  {fabrics.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => setFabric(item.name)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${fabric === item.name ? 'border-brand-gold bg-brand-gold/5 dark:bg-brand-gold/10 shadow-sm' : 'border-brand-beige-dark/20 hover:border-brand-beige-dark/50'}`}
                    >
                      <div className="flex justify-between items-center">
                        <h5 className="font-serif text-base font-bold text-brand-charcoal dark:text-white">{item.name}</h5>
                        <span className="text-xs text-brand-gold font-bold">{item.price > 0 ? `+₹${item.price}` : 'Free'}</span>
                      </div>
                      <p className="text-xs text-brand-charcoal/55 dark:text-brand-cream/55 mt-2 font-light">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Fabric Prints Selector */}
                <h4 className="text-xs uppercase font-bold tracking-wider mb-4 text-brand-blush-dark">Select Fabric Pattern / Print</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                  {fabricPrints.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => setFabricColor(item.name)}
                      className={`group overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-white dark:bg-brand-charcoal/20 flex flex-col justify-between h-[180px] ${fabricColor === item.name
                        ? 'border-brand-gold bg-brand-gold/5 dark:bg-brand-gold/10 shadow-md'
                        : 'border-brand-beige-dark/20 hover:border-brand-beige-dark/50'
                        }`}
                    >
                      {/* Image Preview */}
                      <div className="relative flex-1 overflow-hidden bg-brand-cream-dark/10">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain transition-all duration-700 ease-out group-hover:scale-125"
                          loading="lazy"
                        />
                        {fabricColor === item.name && (
                          <div className="absolute top-2.5 right-2.5 bg-brand-gold text-brand-charcoal p-1 rounded-full shadow-md z-10">
                            <FiCheck className="h-3 w-3" />
                          </div>
                        )}
                      </div>

                      {/* Content Label */}
                      <div className="p-3 border-t border-brand-beige-dark/10 text-center bg-transparent">
                        <span className="font-semibold text-xs text-brand-charcoal dark:text-white transition-colors duration-300 group-hover:text-brand-gold">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- STEP 3: DESIGNS --- */}
            {customStep === 3 && (
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">3. Design Details</h3>
                <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mb-8">Personalize your design details by choosing from our tailored collections.</p>

                {/* Grid of stitching designs: 2 columns on mobile, 4 columns on desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                  {designImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      className={`group overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-white dark:bg-brand-charcoal/20 flex flex-col justify-between h-[180px] sm:h-[240px] ${
                        activeImgIndex === idx
                          ? 'border-brand-gold bg-brand-gold/5 dark:bg-brand-gold/10 shadow-md'
                          : 'border-brand-beige-dark/20 hover:border-brand-beige-dark/50'
                      }`}
                    >
                      {/* Image Preview with Zoom on hover */}
                      <div className="relative flex-1 overflow-hidden bg-brand-cream-dark/10">
                        <img
                          src={img}
                          alt={`Design blueprint ${idx + 1}`}
                          className="w-full h-full object-contain transition-all duration-700 ease-out group-hover:scale-110"
                          loading="lazy"
                        />
                        {activeImgIndex === idx && (
                          <div className="absolute top-2.5 right-2.5 bg-brand-gold text-brand-charcoal p-1 rounded-full shadow-md z-10">
                            <FiCheck className="h-3 w-3" />
                          </div>
                        )}
                      </div>

                      {/* Content Label */}
                      <div className="p-3 border-t border-brand-beige-dark/10 text-center bg-transparent">
                        <span className="font-semibold text-xs text-brand-charcoal dark:text-white transition-colors duration-300 group-hover:text-brand-gold">
                          Design #{idx + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown in Design Details Panel */}
                <div className="mt-8 pt-6 border-t border-brand-beige-dark/15 flex justify-between items-center max-w-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-charcoal/40 dark:text-brand-cream/40">Est. Total Cost</span>
                    <div className="text-2xl font-bold text-brand-gold">₹{totalPrice}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-brand-charcoal/40 dark:text-brand-cream/40">50% Advance Tailoring Fee</span>
                    <div className="text-base font-semibold text-brand-charcoal dark:text-white">₹{halfPrice}</div>
                  </div>
                </div>

              </div>
            )}

            {/* --- STEP 4: REVIEW & HALF PAYMENT --- */}
            {customStep === 4 && (
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">4. Review & Half Payment</h3>
                <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mb-8">Confirm your customized dress configuration and pay 50% advance to start tailoring.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Summary Details */}
                  <div className="bg-brand-cream-light dark:bg-brand-charcoal/40 p-6 rounded-2xl border border-brand-beige-dark/20 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-lg font-bold border-b border-brand-beige-dark/15 pb-2 mb-4">Dress Summary</h4>
                      <ul className="space-y-2.5 text-xs">
                        <li className="flex justify-between"><span className="text-brand-charcoal/50 dark:text-brand-cream/50">Dress Type:</span> <span className="font-semibold">{dressType}</span></li>
                        <li className="flex justify-between"><span className="text-brand-charcoal/50 dark:text-brand-cream/50">Fabric Choice:</span> <span className="font-semibold">{fabric} ({fabricColor})</span></li>
                        <li className="flex justify-between"><span className="text-brand-charcoal/50 dark:text-brand-cream/50">Stitching Design:</span> <span className="font-semibold">Design #{activeImgIndex + 1}</span></li>
                      </ul>
                    </div>

                    <div className="border-t border-brand-beige-dark/15 pt-4 mt-6">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Total Tailoring Cost:</span>
                        <span>₹{totalPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-brand-gold">
                        <span>50% Advance Due Now:</span>
                        <span>₹{halfPrice}</span>
                      </div>
                      <p className="text-[10px] text-brand-charcoal/40 dark:text-brand-cream/40 mt-1 font-light italic">
                        The remaining 50% (₹{halfPrice}) is payable upon delivery.
                      </p>
                    </div>
                  </div>

                  {/* Payment Details Form */}
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-brand-blush-dark">Billing Details</h4>
                    <form onSubmit={handleRazorpayPayment}>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-brand-charcoal/55 dark:text-brand-cream/55 mb-1">Customer Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Aditi Sharma"
                            value={paymentForm.cardName}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })}
                            className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-brand-charcoal/55 dark:text-brand-cream/55 mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. aditi@example.com"
                            value={paymentForm.email}
                            onChange={(e) => setPaymentForm({ ...paymentForm, email: e.target.value })}
                            className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-brand-charcoal/55 dark:text-brand-cream/55 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 9876543210"
                            value={paymentForm.phone}
                            onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })}
                            className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-brand-gold text-brand-charcoal text-xs font-bold py-3.5 rounded-lg hover:bg-brand-charcoal hover:text-white transition duration-300 uppercase tracking-widest mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? "Opening Razorpay..." : `Pay ₹${halfPrice} Advance `}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 5: FULL DRESS CONFIRMATION --- */}
            {customStep === 5 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-6">
                  <FiCheck className="text-emerald-500 h-8 w-8" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-3 text-brand-charcoal dark:text-white">Custom Dress Booked!</h3>
                <p className="text-xs sm:text-sm text-brand-charcoal/60 dark:text-brand-cream/65 max-w-xl mx-auto leading-relaxed mb-8">
                  Your customized dress tailoring process has officially started! Our master designers are working with the finest <strong>{fabric}</strong> to stitch your customized <strong>{dressType}</strong> perfectly.
                </p>

                {/* Status Receipt Card */}
                <div className="bg-brand-cream-light dark:bg-brand-charcoal/40 p-6 rounded-2xl border border-brand-beige-dark/20 max-w-xl mx-auto text-left mb-10 flex flex-col md:flex-row gap-6">
                  {/* Selected Design Preview */}
                  <div className="w-full md:w-36 aspect-[3/4] rounded-xl overflow-hidden border border-brand-beige-dark/30 bg-white flex-shrink-0 flex items-center justify-center shadow-xs">
                    <img src={designImages[activeImgIndex]} alt="Selected design style" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 space-y-2.5 text-xs">
                    <h4 className="font-serif text-sm font-bold uppercase tracking-wider border-b border-brand-beige-dark/15 pb-2 mb-3">Tailoring Order Receipt</h4>
                    <div className="flex justify-between"><span className="text-brand-charcoal/50 dark:text-brand-cream/50">Receipt Number:</span> <span className="font-bold">#DRSQ-CUSTOM-{Math.floor(1000 + Math.random() * 9000)}</span></div>
                    <div className="flex justify-between"><span className="text-brand-charcoal/50 dark:text-brand-cream/50">Dress Style:</span> <span>Custom {dressType} (Design #{activeImgIndex + 1})</span></div>
                    <div className="flex justify-between"><span className="text-brand-charcoal/50 dark:text-brand-cream/50">Fabric & Shade:</span> <span>{fabric} ({fabricColor})</span></div>
                    <div className="flex justify-between"><span className="text-brand-charcoal/50 dark:text-brand-cream/50">Pattern Style:</span> <span>{pattern}</span></div>
                    {customInstructions.trim() && (
                      <div className="flex justify-between">
                        <span className="text-brand-charcoal/50 dark:text-brand-cream/50">Special Requests:</span>
                        <span className="text-right font-light text-brand-charcoal/80 dark:text-brand-cream/80 max-w-[180px] break-words">{customInstructions}</span>
                      </div>
                    )}
                    <div className="flex justify-between"><span className="text-brand-charcoal/50 dark:text-brand-cream/50">Tailoring Timeline:</span> <span className="font-semibold text-brand-blush-dark">7-10 Business Days</span></div>
                    <div className="border-t border-brand-beige-dark/10 pt-2 mt-2 flex justify-between font-bold text-brand-charcoal dark:text-white">
                      <span>Advance Paid:</span>
                      <span className="text-emerald-500">₹{halfPrice} (50%)</span>
                    </div>
                    <div className="flex justify-between font-bold text-brand-gold">
                      <span>Due on Delivery:</span>
                      <span>₹{halfPrice} (50%)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => {
                      setCustomStep(1);
                      setDressType('Kurti');
                      setFabric('Cotton');
                      setFabricColor('Blush Pink');
                      setPattern('Solid Plain');
                      setActiveImgIndex(0);
                      setCustomInstructions('');
                    }}
                    className="border border-brand-beige-dark/30 hover:border-brand-beige-dark text-xs font-semibold px-8 py-3.5 rounded-lg uppercase tracking-wider bg-transparent transition duration-300 text-brand-charcoal dark:text-white cursor-pointer"
                  >
                    Customize Another
                  </button>
                  <button
                    onClick={() => {
                      setShopView('select-design');
                      setSearchParams({});
                    }}
                    className="bg-brand-charcoal text-white text-xs font-semibold px-8 py-3.5 rounded-lg uppercase tracking-wider hover:bg-brand-blush-dark transition duration-300 cursor-pointer"
                  >
                    Browse Catalog
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wizard Navigation Footer */}
          {customStep < 4 && (
            <div className="flex justify-between items-center border-t border-brand-beige-dark/15 pt-6 mt-8">
              <button
                disabled={customStep === 1}
                onClick={() => setCustomStep(prev => prev - 1)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-brand-blush-dark disabled:opacity-30 transition"
              >
                <FiArrowLeft /> Previous
              </button>
              <button
                onClick={() => setCustomStep(prev => prev + 1)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-brand-charcoal text-white dark:bg-brand-cream dark:text-brand-charcoal px-6 py-3 rounded-lg hover:bg-brand-blush-dark transition"
              >
                Next Step <FiArrowRight />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

