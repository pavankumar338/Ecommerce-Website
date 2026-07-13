import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { supabase } from '../services/supabase';

// Fallback configuration constants
const fallbackDesignImages = [
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

const fallbackFabricPrints = [
  { name: 'Traditional Print', image: '/cotton/cotton1.png' },
  { name: 'Floral Bloom', image: '/cotton/cotton2.png' },
  { name: 'Ethnic Weave', image: '/cotton/cotton3.png' },
  { name: 'Indigo Dream', image: '/cotton/cotton4.png' },
  { name: 'Royal Gold Motif', image: '/cotton/cotton5.png' },
  { name: 'Summer Breeze', image: '/cotton/cotton6.png' },
  { name: 'Vintage Ornament', image: '/cotton/cotton7.png' },
  { name: 'Festive Zari', image: '/cotton/cotton8.png' }
];

const fallbackDressTypes = [
  { name: 'Kurti', price: 120, image: '/kurtis.png', desc: 'Contemporary tunic style' },
  { name: 'Office-Wear Kurti', price: 180, image: 'OfficeWearKurti.png', desc: 'Royal flared silhouette' },
  { name: 'Short Kurti', price: 380, image: 'shortkurtis.png', desc: 'Bespoke bridal flared skirt set' },
  { name: 'Dupatta', price: 240, image: '/dupatta.png', desc: 'Classic 6-yard elegant drape' },
  { name: 'Kurtaset', price: 200, image: '/kurtaset.png', desc: 'Modern formal ethnic fusion' }
];

export const Shop: React.FC = () => {
  const { user, authLoading } = useShop();
  const navigate = useNavigate();

  // Customization Wizard States
  const [customStep, setCustomStep] = useState(1);
  const [dressType, setDressType] = useState('Kurti');
  const [fabric, setFabric] = useState('Cotton');
  const [fabricColor, setFabricColor] = useState('Traditional Print');
  const [lining, setLining] = useState('With Lining');
  const [pattern, setPattern] = useState('Solid Plain');

  // Dynamic configuration lists from Supabase
  const [dressTypes, setDressTypes] = useState<any[]>(fallbackDressTypes);
  const [fabricPrints, setFabricPrints] = useState<any[]>(fallbackFabricPrints);
  const [designImages, setDesignImages] = useState<string[]>(fallbackDesignImages);

  useEffect(() => {
    const fetchCustomizationOptions = async () => {
      try {
        const { data: dt, error: dtErr } = await supabase.from('custom_dress_types').select('*').order('id', { ascending: true });
        if (!dtErr && dt && dt.length > 0) {
          const mapped = dt.map(item => ({
            name: item.name,
            price: Number(item.price),
            image: item.image_url,
            desc: item.description || ''
          }));
          setDressTypes(mapped);
          setDressType(mapped[0].name);
        }

        const { data: fb, error: fbErr } = await supabase.from('custom_fabrics').select('*').order('id', { ascending: true });
        if (!fbErr && fb && fb.length > 0) {
          const mapped = fb.map(item => ({
            name: item.name,
            price: Number(item.price),
            image: item.image_url
          }));
          setFabricPrints(mapped);
          setFabricColor(mapped[0].name);
        }

        const { data: ds, error: dsErr } = await supabase.from('custom_designs').select('*').order('id', { ascending: true });
        if (!dsErr && ds && ds.length > 0) {
          setDesignImages(ds.map(item => item.image_url));
        }
      } catch (err) {
        console.error("Failed fetching dynamic customization config:", err);
      }
    };
    fetchCustomizationOptions();
  }, []);

  // Design Gallery & Customization States
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [customColor, setCustomColor] = useState<string>('');
  const [tempHfToken, setTempHfToken] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');
  const [isGeneratingLive, setIsGeneratingLive] = useState<boolean>(false);

  // 3D View Generation States
  const [generationProgress, setGenerationProgress] = useState(0);

  // Reset active image index when dress type changes
  useEffect(() => {
    setActiveImgIndex(0);
  }, [dressType]);

  const buildPrompt = () => {
    // Map abstract fabric print names to concrete color/pattern descriptions to guide the AI model
    const colorMap: Record<string, string> = {
      'Traditional Print': 'crimson red and beige traditional handblock print',
      'Floral Bloom': 'pastel pink and cream floral bloom print',
      'Ethnic Weave': 'multicolored traditional ethnic weave pattern',
      'Indigo Dream': 'deep indigo blue block print',
      'Royal Gold Motif': 'royal blue with rich golden zari motifs',
      'Summer Breeze': 'light mint green and pastel yellow floral print',
      'Vintage Ornament': 'crimson red with gold vintage ornamental print',
      'Festive Zari': 'maroon with elaborate gold borders and festive zari work'
    };

    const exactColorDescription = customColor.trim()
      ? `exact color: ${customColor}`
      : `color and print style of ${colorMap[fabricColor] || fabricColor}`;

    const stitchDetails = customInstructions.trim() ? `, tailoring details: ${customInstructions}` : '';

    return `A premium fashion catalog photography showing a single high-fashion woman model posing in a complete full-length Indian ${dressType}. The dress is made of ${fabric} fabric with the ${exactColorDescription}, featuring a beautiful ${pattern} pattern design${stitchDetails}. The photo shows a side-by-side dual view displaying both the full front view and the full back view of the model wearing the exact same dress, set against a clean plain white studio background. Photorealistic, 8k resolution, extremely detailed fabric texture, consistent colors.`;
  };

  const generateFluxImage = async () => {
    const hfToken = import.meta.env.VITE_HF_TOKEN || tempHfToken;
    if (!hfToken) {
      setApiError("Please configure your VITE_HF_TOKEN in the .env file or enter it below to generate.");
      return;
    }

    setIsGeneratingLive(true);
    setApiError('');
    setGenerationProgress(5);

    // Simulate generation progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 400);

    try {
      const promptText = buildPrompt();

      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: promptText
          }),
        }
      );

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      setGenerationProgress(100);
      setGeneratedImageUrl(imageUrl);
      toast.success("AI Dress Preview generated successfully!");
    } catch (error: any) {
      clearInterval(progressInterval);
      console.error("Hugging Face API Error:", error);
      setApiError(error.message || "Failed to contact Hugging Face API. Please check your network and token.");
      toast.error("Failed to generate AI preview.");
    } finally {
      setIsGeneratingLive(false);
    }
  };

  // Automatically trigger AI preview when Step 4 is active
  useEffect(() => {
    if (customStep === 4) {
      const hfToken = import.meta.env.VITE_HF_TOKEN || tempHfToken;
      if (hfToken && !generatedImageUrl) {
        generateFluxImage();
      }
    }
  }, [customStep, tempHfToken]);

  // Payment Form States
  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    toast.info("Simulating secure tailoring advance payment... 💳");

    setTimeout(async () => {
      try {
        const formattedPattern = `Design #${activeImgIndex + 1}`;
        const mockPaymentId = `pay_${Math.floor(100000 + Math.random() * 900000)}`;

        const customOrder = {
          user_id: user?.id || null,
          customer_name: paymentForm.cardName,
          customer_email: paymentForm.email,
          customer_phone: paymentForm.phone,
          dress_type: dressType,
          fabric: fabric,
          fabric_color: customColor ? `${customColor} | ${fabricColor} (${lining})` : `${fabricColor} (${lining})`,
          pattern: customInstructions ? `${formattedPattern} | Custom Requests: ${customInstructions}` : formattedPattern,
          total_price: totalPrice,
          advance_paid: halfPrice,
          due_amount: halfPrice,
          razorpay_payment_id: mockPaymentId,
          payment_status: 'Paid (50% Advance)',
          status: 'Stitching'
        };

        const { error } = await supabase.from('custom_orders').insert(customOrder);

        if (error) {
          console.error("Database insert error:", error);
          toast.error("Mock payment failed to save order details. Please contact support.");
        } else {
          toast.success("Advance payment successful! Stitching has begun. ✨");
          setCustomStep(6);
        }
      } catch (err) {
        console.error("Order insertion error:", err);
        toast.error("An unexpected error occurred while saving your order.");
      } finally {
        setIsSubmitting(false);
      }
    }, 1500);
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Customization Header */}
      <div className="flex flex-col items-center mb-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal dark:text-white text-center">
          Bespoke Tailoring Studio
        </h1>
        <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mt-2 font-medium text-center">
          Stitch your dream outfit step by step
        </p>
      </div>

      <div className="bg-white dark:bg-brand-charcoal/20 p-4 sm:p-8 md:p-10 rounded-3xl border border-brand-beige-dark/15 shadow-sm max-w-6xl mx-auto w-full">
        {/* Horizontal Step Indicator */}
        <div className="flex justify-between items-center max-w-xl mx-auto mb-12">
          {[
            { step: 1, label: "Dress Type" },
            { step: 2, label: "Fabric" },
            { step: 3, label: "Designs" },
            { step: 4, label: "Full Dress" },
            { step: 5, label: "Half Payment" }
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
                {dressTypes.map((item) => (
                  <div
                    key={item.name}
                    onClick={() => setDressType(item.name)}
                    className={`group overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-white dark:bg-brand-charcoal/20 flex flex-col justify-between h-[220px] xs:h-[260px] sm:h-[340px] ${dressType === item.name ? 'border-brand-gold bg-brand-gold/5 dark:bg-brand-gold/10 shadow-md' : 'border-brand-beige-dark/20 hover:border-brand-beige-dark/50'}`}
                  >
                    {/* Image Container */}
                    <div className="relative flex-1 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-fill transition-all duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                      {dressType === item.name && (
                        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-brand-gold text-brand-charcoal p-1 sm:p-1.5 rounded-full shadow-md z-10">
                          <FiCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                      )}
                    </div>

                    {/* Content Container */}
                    <div className="p-3 sm:p-4 bg-transparent border-t border-brand-beige-dark/10 flex flex-col">
                      <h4 className="font-serif text-sm sm:text-base font-bold text-brand-charcoal dark:text-white transition-colors duration-300 group-hover:text-brand-gold">
                        {item.name}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-brand-charcoal/60 dark:text-brand-cream/60 mt-1 font-light leading-relaxed truncate">
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

              {/* Fabric Prints Selector */}
              <h4 className="text-xs uppercase font-bold tracking-wider mb-4 text-brand-blush-dark">Select Fabric Pattern / Print</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                {fabricPrints.map((item) => (
                  <div
                    key={item.name}
                    onClick={() => setFabricColor(item.name)}
                    className={`group overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-white dark:bg-brand-charcoal/20 flex flex-col justify-between h-[210px] ${fabricColor === item.name
                      ? 'border-brand-gold bg-brand-gold/5 dark:bg-brand-gold/10 shadow-md'
                      : 'border-brand-beige-dark/20 hover:border-brand-beige-dark/50'
                      }`}
                  >
                    {/* Image Preview */}
                    <div className="relative flex-1 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-fill transition-all duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                      {fabricColor === item.name && (
                        <div className="absolute top-2.5 right-2.5 bg-brand-gold text-brand-charcoal p-1 rounded-full shadow-md z-10">
                          <FiCheck className="h-3 w-3" />
                        </div>
                      )}
                    </div>

                    {/* Content Label */}
                    <div className="p-2 border-t border-brand-beige-dark/10 text-center bg-white dark:bg-brand-charcoal/80 flex flex-col items-center gap-1.5">
                      <span className="text-[9px] font-bold tracking-widest text-brand-charcoal/50 dark:text-brand-cream/50 uppercase block truncate max-w-full">
                        {item.name}
                      </span>
                      <div className="flex w-full gap-1 p-0.5 bg-brand-cream-light dark:bg-brand-charcoal/60 rounded-lg">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFabricColor(item.name);
                            setLining('With Lining');
                          }}
                          className={`flex-1 text-[10px] py-1.5 px-1 rounded-md font-bold tracking-wide transition-all duration-200 cursor-pointer ${fabricColor === item.name && lining === 'With Lining'
                            ? 'bg-brand-gold text-brand-charcoal shadow-sm'
                            : 'bg-brand-cream-dark/15 dark:bg-black/35 text-brand-charcoal/50 dark:text-brand-cream/50 hover:bg-brand-cream-dark/25'
                            }`}
                        >
                          With Lining
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFabricColor(item.name);
                            setLining('Without Lining');
                          }}
                          className={`flex-1 text-[10px] py-1.5 px-1 rounded-md font-bold tracking-wide transition-all duration-200 cursor-pointer ${fabricColor === item.name && lining === 'Without Lining'
                            ? 'bg-brand-gold text-brand-charcoal shadow-sm'
                            : 'bg-brand-cream-dark/15 dark:bg-black/35 text-brand-charcoal/50 dark:text-brand-cream/50 hover:bg-brand-cream-dark/25'
                            }`}
                        >
                          Without
                        </button>
                      </div>
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
                    className={`group overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-white dark:bg-brand-charcoal/20 flex flex-col justify-between h-[180px] sm:h-[240px] ${activeImgIndex === idx
                      ? 'border-brand-gold bg-brand-gold/5 dark:bg-brand-gold/10 shadow-md'
                      : 'border-brand-beige-dark/20 hover:border-brand-beige-dark/50'
                      }`}
                  >
                    {/* Image Preview with Zoom on hover */}
                    <div className="relative flex-1 overflow-hidden">
                      <img
                        src={img}
                        alt={`Design blueprint ${idx + 1}`}
                        className="w-full h-full object-fill transition-all duration-700 ease-out group-hover:scale-110"
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

          {/* --- STEP 4: BESPOKE AI DESIGNER STUDIO --- */}
          {customStep === 4 && (
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">4. Bespoke AI Designer Studio</h3>
              <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mb-8">Generate a custom 2D photo catalog showing front and back views of your tailor specifications.</p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel (Left) */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  <div className="bg-brand-cream-light dark:bg-brand-charcoal/40 p-5 rounded-2xl border border-brand-beige-dark/15 space-y-5">
                    <h4 className="font-serif text-sm font-bold uppercase tracking-wider border-b border-brand-beige-dark/15 pb-2">Custom Requirements</h4>

                    {/* Custom Color Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase font-bold text-brand-charcoal/60 dark:text-brand-cream/60">Dress Color / Theme</label>
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setApiError('');
                        }}
                        placeholder="e.g. Lavender with golden sequin highlights"
                        className="w-full bg-white dark:bg-black/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-gold dark:text-brand-cream"
                      />
                    </div>

                    {/* Custom Stitching Instructions */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase font-bold text-brand-charcoal/60 dark:text-brand-cream/60">Stitching Requests & Notes</label>
                      <textarea
                        rows={3}
                        value={customInstructions}
                        onChange={(e) => {
                          setCustomInstructions(e.target.value);
                          setApiError('');
                        }}
                        placeholder="e.g. Sleeveless, sweetheart neckline, ankle-length, slits on both sides."
                        className="w-full bg-white dark:bg-black/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-gold dark:text-brand-cream resize-none"
                      />
                    </div>

                    {/* Developer/Testing Credentials (if no Env Key) */}
                    {!import.meta.env.VITE_HF_TOKEN && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-500/25 p-4 rounded-xl flex flex-col gap-3">
                        <div className="flex gap-2 text-amber-700 dark:text-amber-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <span className="font-bold text-xs block">VITE_HF_TOKEN Missing</span>
                            <span className="text-[10px] font-medium leading-relaxed block mt-0.5">
                              Add it to `.env` or input it below for instant client-side rendering.
                            </span>
                          </div>
                        </div>
                        <input
                          type="password"
                          value={tempHfToken}
                          onChange={(e) => {
                            setTempHfToken(e.target.value);
                            setApiError('');
                          }}
                          placeholder="Paste Hugging Face Token here..."
                          className="w-full bg-white dark:bg-black/50 text-[10px] px-3 py-2 rounded-lg border border-amber-500/30 focus:outline-none focus:border-brand-gold dark:text-brand-cream"
                        />
                      </div>
                    )}

                    <button
                      onClick={generateFluxImage}
                      disabled={isGeneratingLive}
                      className="w-full bg-brand-charcoal text-white dark:bg-brand-cream dark:text-brand-charcoal text-[10px] font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-brand-blush-dark transition cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingLive ? "Rendering Details..." : "Generate Custom AI Preview"}
                    </button>
                  </div>
                </div>

                {/* AI Showcase Canvas (Right, 65%) */}
                <div className="lg:col-span-2 flex flex-col">
                  {isGeneratingLive ? (
                    <div className="bg-brand-charcoal dark:bg-black/95 rounded-2xl h-[460px] border border-brand-beige-dark/20 flex flex-col items-center justify-center p-8 text-center shadow-2xl">
                      <div className="relative w-20 h-20 mb-8">
                        <div className="absolute inset-0 rounded-full border-4 border-brand-gold/10 animate-pulse"></div>
                        <div className="absolute inset-0 rounded-full border-t-4 border-brand-gold animate-spin"></div>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold">Rendering Dress Preview</span>
                      <div className="w-64 bg-brand-cream-dark/20 h-1 rounded-full overflow-hidden mt-4 mb-2">
                        <div
                          className="bg-brand-gold h-full transition-all duration-300 ease-out"
                          style={{ width: `${generationProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono text-brand-cream/60">
                        {generationProgress}%
                      </span>
                      <p className="text-xs font-serif italic text-white/40 mt-4 h-4 transition-all duration-300">
                        {generationProgress < 20 && "Structuring fabric silhouette..."}
                        {generationProgress >= 20 && generationProgress < 50 && `Dyeing fabric: ${customColor || fabricColor}...`}
                        {generationProgress >= 50 && generationProgress < 75 && `Stitching tailored pattern...`}
                        {generationProgress >= 75 && generationProgress < 95 && "Synthesizing front & back catalog photography..."}
                        {generationProgress >= 95 && "Polishing showcase canvas..."}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-brand-charcoal dark:bg-black/95 rounded-2xl relative overflow-hidden h-[460px] border border-brand-beige-dark/20 flex flex-col justify-between p-4 shadow-2xl">
                      {apiError ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                          <p className="text-red-400 text-xs font-medium max-w-sm mb-4">{apiError}</p>
                          <button onClick={generateFluxImage} className="bg-white/10 text-white text-[10px] uppercase tracking-wider font-bold px-5 py-2.5 rounded-lg border border-white/10 hover:bg-white/20 transition">
                            Try Again
                          </button>
                        </div>
                      ) : generatedImageUrl ? (
                        <>
                          {/* Image Container */}
                          <div className="relative flex-1 flex items-center justify-center p-2 overflow-hidden">
                            <div className="w-full h-full max-h-[380px] rounded-xl overflow-hidden shadow-2xl border border-white/10 relative transition-transform duration-500 hover:scale-[1.02] bg-white">
                              <img
                                src={generatedImageUrl}
                                alt="Bespoke custom dress generated by AI"
                                className="w-full h-full object-contain"
                                onLoad={() => {
                                  setIsGeneratingLive(false);
                                  setGenerationProgress(100);
                                  if ((window as any)._progressInterval) {
                                    clearInterval((window as any)._progressInterval);
                                  }
                                }}
                                onError={() => {
                                  setIsGeneratingLive(false);
                                  if ((window as any)._progressInterval) {
                                    clearInterval((window as any)._progressInterval);
                                  }
                                  setApiError("Failed to render the AI image. Please try again.");
                                }}
                              />
                              <div className="absolute bottom-3 left-3 bg-brand-charcoal/80 backdrop-blur-md text-brand-gold text-[8px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Custom Tailored Preview (Front & Back)
                              </div>
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="relative z-10 flex justify-between items-center text-white/50 text-[10px] tracking-wider font-bold">
                            <span className="uppercase text-brand-gold/70">AURA AI CANVAS v2.0</span>
                            <div className="flex gap-2">
                              <a
                                href={generatedImageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-brand-charcoal/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 hover:text-white transition flex items-center gap-1"
                              >
                                View Fullscreen
                              </a>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                          <p className="text-white/40 text-xs font-serif italic mb-4">No preview generated. Fill in requirements and click generate.</p>
                          <button onClick={generateFluxImage} className="bg-brand-gold hover:bg-brand-cream hover:text-brand-charcoal text-brand-charcoal text-[10px] uppercase font-bold py-2.5 px-6 rounded-lg transition shadow-md">
                            Generate AI Preview
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- STEP 5: REVIEW & HALF PAYMENT --- */}
          {customStep === 5 && (
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">5. Review & Half Payment</h3>
              <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mb-8">Confirm your customized dress configuration and pay 50% advance to start tailoring.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Summary Details */}
                <div className="bg-brand-cream-light dark:bg-brand-charcoal/40 p-6 rounded-2xl border border-brand-beige-dark/20 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-lg font-bold border-b border-brand-beige-dark/15 pb-2 mb-4">Dress Summary</h4>
                    <ul className="space-y-2.5 text-xs">
                      <li className="flex justify-between"><span className="text-brand-charcoal/50 dark:text-brand-cream/50">Dress Type:</span> <span className="font-semibold">{dressType}</span></li>
                      <li className="flex justify-between"><span className="text-brand-charcoal/50 dark:text-brand-cream/50">Fabric Choice:</span> <span className="font-semibold">{fabric} ({fabricColor} - {lining})</span></li>
                      <li className="flex justify-between"><span className="text-brand-charcoal/50 dark:text-brand-cream/50">Stitching Design:</span> <span className="font-semibold">Design #{activeImgIndex + 1}</span></li>
                      {customColor.trim() && (
                        <li className="flex justify-between"><span className="text-brand-charcoal/50 dark:text-brand-cream/50">Custom Color:</span> <span className="font-semibold text-brand-blush-dark">{customColor}</span></li>
                      )}
                      {customInstructions.trim() && (
                        <li className="flex justify-between">
                          <span className="text-brand-charcoal/50 dark:text-brand-cream/50">Stitching Requests:</span>
                          <span className="font-semibold text-right max-w-[180px] break-words">{customInstructions}</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {generatedImageUrl && (
                    <div className="mt-4 pt-4 border-t border-brand-beige-dark/15 flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-brand-beige-dark/30 shadow-xs flex-shrink-0 bg-white">
                        <img src={generatedImageUrl} alt="AI Custom preview" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-xs block text-brand-charcoal dark:text-white">AI Tailored Design Preview</span>
                        <span className="text-[10px] text-brand-charcoal/50 dark:text-brand-cream/50 block">Front & Back Visualized</span>
                      </div>
                    </div>
                  )}

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
                  <form onSubmit={handleRazorpayPayment} className="space-y-4">
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        name="cardName"
                        value={paymentForm.cardName}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })}
                        placeholder="Sophia Laurent"
                        className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          name="email"
                          value={paymentForm.email}
                          onChange={(e) => setPaymentForm({ ...paymentForm, email: e.target.value })}
                          placeholder="sophia@example.com"
                          className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          name="phone"
                          value={paymentForm.phone}
                          onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })}
                          placeholder="9876543210"
                          className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-4 bg-brand-gold hover:bg-brand-charcoal hover:text-white text-brand-charcoal font-sans text-xs font-semibold tracking-widest uppercase py-4 rounded-lg transition duration-300 shadow-lg shadow-brand-gold/10 disabled:opacity-50"
                    >
                      {isSubmitting ? "Opening Gateway..." : `Pay ₹${halfPrice} Advance`}
                    </button>
                  </form>
                </div>
              </div>

            </div>
          )}

          {/* --- STEP 6: CUSTOM DRESS CONFIRMATION --- */}
          {customStep === 6 && (
            <div className="max-w-xl mx-auto text-center py-8">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheck className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white">Order Placed Successfully!</h3>
              <p className="text-xs text-brand-charcoal/60 dark:text-brand-cream/60 mt-3 leading-relaxed">
                Your customized dress tailoring process has officially started! Our master designers are working with the finest <strong>{fabric}</strong> to stitch your customized <strong>{dressType}</strong> perfectly.
              </p>

              <div className="bg-brand-cream-light dark:bg-brand-charcoal/45 p-6 rounded-2xl border border-brand-beige-dark/20 text-left my-8 space-y-2 text-xs">
                <h4 className="font-serif text-sm font-bold uppercase tracking-wider border-b border-brand-beige-dark/15 pb-2 mb-3">Tailoring Order Receipt</h4>
                <div className="flex justify-between"><span className="text-brand-charcoal/50 dark:text-brand-cream/50">Receipt Number:</span> <span className="font-bold">#DRSQ-CUSTOM-{Math.floor(1000 + Math.random() * 9000)}</span></div>
                <div className="flex justify-between"><span className="text-brand-charcoal/50 dark:text-brand-cream/50">Dress Style:</span> <span>Custom {dressType} (Design #{activeImgIndex + 1})</span></div>
                <div className="flex justify-between"><span className="text-brand-charcoal/50 dark:text-brand-cream/50">Fabric & Shade:</span> <span>{fabric} ({fabricColor} - {lining})</span></div>
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

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => {
                    setCustomStep(1);
                    setDressType('Kurti');
                    setFabric('Cotton');
                    setFabricColor('Blush Pink');
                    setLining('With Lining');
                    setPattern('Solid Plain');
                    setActiveImgIndex(0);
                    setCustomInstructions('');
                    setCustomColor('');
                    setGeneratedImageUrl('');
                    setApiError('');
                  }}
                  className="border border-brand-beige-dark/30 hover:border-brand-beige-dark text-xs font-semibold px-8 py-3.5 rounded-lg uppercase tracking-wider bg-transparent transition duration-300 text-brand-charcoal dark:text-white cursor-pointer"
                >
                  Customize Another
                </button>
                <button
                  onClick={() => {
                    navigate('/');
                  }}
                  className="bg-brand-charcoal text-white text-xs font-semibold px-8 py-3.5 rounded-lg uppercase tracking-wider hover:bg-brand-blush-dark transition duration-300 cursor-pointer"
                >
                  Go Home
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Navigation Footer */}
        {customStep < 5 && (
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
        {customStep === 5 && (
          <div className="flex justify-start items-center border-t border-brand-beige-dark/15 pt-6 mt-8">
            <button
              onClick={() => setCustomStep(4)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-brand-blush-dark transition"
            >
              <FiArrowLeft /> Previous
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
