import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { toast } from 'react-toastify';
import {
  FiDollarSign, FiShoppingBag, FiUsers,
  FiPercent, FiPlus, FiTrash2, FiEdit,
  FiUpload, FiLoader
} from 'react-icons/fi';
import { supabase } from '../services/supabase';

// Helper: Compress image to fit nicely within base64 or upload limits
const compressImage = (file: File, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string); // fallback to original base64
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// Helper: Convert Base64 data URL to Blob for Supabase upload
const dataURLtoBlob = (dataurl: string): Blob => {
  try {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error("Failed to parse data URL to Blob", e);
    return new Blob([], { type: 'image/jpeg' });
  }
};

export const AdminDashboard: React.FC = () => {
  const {
    user, products, orders, seedDatabase, coupons, addCoupon, deleteCoupon,
    createProduct, updateProduct, deleteProduct, categories
  } = useShop();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Coupons states
  const [newCode, setNewCode] = useState('');
  const [newVal, setNewVal] = useState(10);
  const [newType, setNewType] = useState<'percentage' | 'fixed'>('percentage');

  // Product modal and edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [prodName, setProdName] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodDiscountPrice, setProdDiscountPrice] = useState<number | undefined>(undefined);
  const [prodCategory, setProdCategory] = useState('Casual Wear');
  const [prodBrand, setProdBrand] = useState('Viora');
  const [prodColorsInput, setProdColorsInput] = useState('');
  const [prodSizes, setProdSizes] = useState<string[]>([]);
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [singleImageUrlInput, setSingleImageUrlInput] = useState('');
  const [prodStock, setProdStock] = useState(10);
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodTrending, setProdTrending] = useState(false);
  const [prodBestSeller, setProdBestSeller] = useState(false);
  const [prodNewArrival, setProdNewArrival] = useState(false);

  const totalSales = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrders = orders.length;
  const uniqueCustomers = Array.from(new Set(orders.map(o => o.shippingAddress?.email || ''))).filter(Boolean).length;

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-20 text-center px-4">
        <h2 className="font-serif text-2xl font-bold text-brand-charcoal dark:text-white">Admin Credentials Required</h2>
        <p className="text-xs text-brand-charcoal/60 mt-1">Please sign in as an administrator to access the dashboard.</p>
        <button onClick={() => navigate('/login')} className="mt-6 bg-brand-charcoal text-white text-xs font-semibold px-8 py-3.5 rounded-lg">
          Login as Admin
        </button>
      </div>
    );
  }

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCode.trim()) {
      const res = await addCoupon(newCode, newType, newVal);
      if (res.success) {
        toast.success(res.message);
        setNewCode('');
      } else {
        toast.error(res.message);
      }
    }
  };

  const handleRemoveCoupon = async (code: string) => {
    const res = await deleteCoupon(code);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };
  // Product modal handlers
  const openAddModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDescription('');
    setProdPrice(0);
    setProdDiscountPrice(undefined);
    setProdCategory(categories[0] || 'Casual Wear');
    setProdBrand('Viora');
    setProdColorsInput('Blush Pink, Lavender, Cream');
    setProdSizes(['S', 'M', 'L']);
    setProdImages(['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800']);
    setSingleImageUrlInput('');
    setProdStock(15);
    setProdFeatured(false);
    setProdTrending(false);
    setProdBestSeller(false);
    setProdNewArrival(true);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: any) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdDescription(prod.description || '');
    setProdPrice(prod.price);
    setProdDiscountPrice(prod.discountPrice);
    setProdCategory(prod.category);
    setProdBrand(prod.brand || 'Viora');
    setProdColorsInput((prod.color || []).join(', '));
    setProdSizes(prod.sizes || []);
    setProdImages(prod.images || []);
    setSingleImageUrlInput('');
    setProdStock(prod.stock || 0);
    setProdFeatured(prod.featured || false);
    setProdTrending(prod.trending || false);
    setProdBestSeller(prod.bestSeller || false);
    setProdNewArrival(prod.newArrival || false);
    setIsModalOpen(true);
  };

  const handleAddImageUrl = () => {
    if (singleImageUrlInput.trim()) {
      setProdImages([...prodImages, singleImageUrlInput.trim()]);
      setSingleImageUrlInput('');
      toast.success("Image URL added! 🖼️");
    } else {
      toast.error("Please enter a valid image URL.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let fallbackCount = 0;
    const newImages = [...prodImages];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Compress first
        const compressedBase64 = await compressImage(file);

        // Try uploading to Supabase
        const blob = dataURLtoBlob(compressedBase64);
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

        const { error } = await supabase.storage
          .from('product-images')
          .upload(fileName, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: true });

        if (error) {
          console.warn("Supabase Storage upload failed, fallback to base64:", error.message);
          newImages.push(compressedBase64);
          fallbackCount++;
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

          newImages.push(publicUrlData.publicUrl);
          successCount++;
        }
      } catch (err: any) {
        console.error("Error processing file:", err);
        toast.error(`Error uploading ${file.name}`);
      }
    }

    setProdImages(newImages);
    setIsUploading(false);

    if (successCount > 0 && fallbackCount > 0) {
      toast.success(`Uploaded ${successCount} images to storage and saved ${fallbackCount} locally! ✨`);
    } else if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} image(s)! 💫`);
    } else if (fallbackCount > 0) {
      toast.info(`Processed ${fallbackCount} image(s) locally as Base64! 💾`);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUploading) {
      toast.warning("Please wait for images to finish uploading/processing.");
      return;
    }

    if (prodImages.length === 0) {
      toast.error("Please add at least one product image.");
      return;
    }

    const colorArray = prodColorsInput
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const productPayload = {
      name: prodName,
      description: prodDescription,
      price: Number(prodPrice),
      discountPrice: prodDiscountPrice ? Number(prodDiscountPrice) : undefined,
      category: prodCategory,
      brand: prodBrand,
      color: colorArray,
      sizes: prodSizes,
      images: prodImages,
      stock: Number(prodStock),
      featured: prodFeatured,
      trending: prodTrending,
      bestSeller: prodBestSeller,
      newArrival: prodNewArrival
    };

    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, productPayload);
    } else {
      result = await createProduct(productPayload);
    }

    if (result.success) {
      toast.success(result.message);
      setIsModalOpen(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm("Are you sure you want to permanently delete this product? 🗑️")) {
      const result = await deleteProduct(productId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Page Header */}
      <div className="mb-12 border-b border-brand-beige-dark/15 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-charcoal dark:text-white">Management Concierge</h1>
          <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mt-1">Control products, catalog, coupons, reviews, and client orders.</p>
        </div>
        <div className="flex gap-2">
          {['overview', 'products', 'orders', 'coupons'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs uppercase tracking-widest font-bold px-4 py-2.5 rounded-full transition ${activeTab === tab ? 'bg-brand-charcoal text-white dark:bg-brand-cream dark:text-brand-charcoal' : 'bg-white dark:bg-brand-charcoal/20 border border-brand-beige-dark/20 text-brand-charcoal dark:text-brand-cream'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: Overview Stats */}
      {activeTab === 'overview' && (
        <div className="space-y-12">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="bg-white dark:bg-brand-charcoal/20 p-6 rounded-2xl border border-brand-beige-dark/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-brand-charcoal/40 dark:text-brand-cream/40 uppercase font-bold tracking-wider">Total Sales</span>
                <h3 className="text-2xl font-bold text-brand-charcoal dark:text-white mt-1">₹{totalSales}</h3>
              </div>
              <div className="bg-brand-blush p-3 rounded-full text-brand-charcoal"><FiDollarSign className="h-5 w-5" /></div>
            </div>

            <div className="bg-white dark:bg-brand-charcoal/20 p-6 rounded-2xl border border-brand-beige-dark/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-brand-charcoal/40 dark:text-brand-cream/40 uppercase font-bold tracking-wider">Total Orders</span>
                <h3 className="text-2xl font-bold text-brand-charcoal dark:text-white mt-1">{totalOrders}</h3>
              </div>
              <div className="bg-brand-lavender p-3 rounded-full text-brand-charcoal"><FiShoppingBag className="h-5 w-5" /></div>
            </div>

            <div className="bg-white dark:bg-brand-charcoal/20 p-6 rounded-2xl border border-brand-beige-dark/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-brand-charcoal/40 dark:text-brand-cream/40 uppercase font-bold tracking-wider">Customers</span>
                <h3 className="text-2xl font-bold text-brand-charcoal dark:text-white mt-1">{uniqueCustomers}</h3>
              </div>
              <div className="bg-brand-beige p-3 rounded-full text-brand-charcoal"><FiUsers className="h-5 w-5" /></div>
            </div>

            <div className="bg-white dark:bg-brand-charcoal/20 p-6 rounded-2xl border border-brand-beige-dark/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-brand-charcoal/40 dark:text-brand-cream/40 uppercase font-bold tracking-wider">Active Coupons</span>
                <h3 className="text-2xl font-bold text-brand-charcoal dark:text-white mt-1">{coupons.length}</h3>
              </div>
              <div className="bg-brand-blush p-3 rounded-full text-brand-charcoal"><FiPercent className="h-5 w-5" /></div>
            </div>

          </div>

          {/* Inventory Status List */}
          <div className="bg-white dark:bg-brand-charcoal/20 p-8 rounded-2xl border border-brand-beige-dark/15">
            <h3 className="font-serif text-lg font-bold border-b border-brand-beige-dark/10 pb-4 mb-6">Inventory status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-beige-dark/15 text-[10px] uppercase font-bold text-brand-charcoal/40 dark:text-brand-cream/40">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-beige-dark/10 text-xs">
                  {products.map(prod => (
                    <tr key={prod.id}>
                      <td className="py-3 font-semibold">{prod.name}</td>
                      <td className="py-3 text-brand-charcoal/60 dark:text-brand-cream-light/60">{prod.category}</td>
                      <td className="py-3 font-bold">₹{prod.discountPrice || prod.price}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] ${prod.stock < 5 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                          {prod.stock} left
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Products list management */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-brand-charcoal/20 p-8 rounded-2xl border border-brand-beige-dark/15">
          <div className="flex justify-between items-center border-b border-brand-beige-dark/10 pb-4 mb-6">
            <h3 className="font-serif text-lg font-bold">Catalog Products</h3>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const res = await seedDatabase();
                  if (res.success) {
                    toast.success(res.message);
                  } else {
                    toast.warning(res.message);
                  }
                }}
                className="bg-brand-blush text-brand-charcoal text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 hover:bg-brand-blush-dark hover:text-white transition"
              >
                Seed Catalog to Supabase
              </button>
              <button
                onClick={openAddModal}
                className="bg-brand-charcoal text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 hover:bg-brand-blush-dark transition"
              >
                <FiPlus /> Add Product
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {products.map(prod => (
              <div key={prod.id} className="flex gap-4 items-center justify-between py-3 border-b border-brand-beige-dark/10 last:border-0 text-xs">
                <div className="flex items-center gap-3">
                  <img src={prod.images[0]} alt="" className="w-10 h-12 object-cover rounded-lg" />
                  <div>
                    <h4 className="font-bold">{prod.name}</h4>
                    <p className="text-[10px] text-brand-charcoal/50 dark:text-brand-cream/50">{prod.category} | {prod.brand}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-bold">₹{prod.discountPrice || prod.price}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="p-2 hover:bg-brand-blush/30 rounded-lg text-brand-charcoal/60 dark:text-brand-cream/60"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Orders history status updates */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-brand-charcoal/20 p-8 rounded-2xl border border-brand-beige-dark/15">
          <h3 className="font-serif text-lg font-bold border-b border-brand-beige-dark/10 pb-4 mb-6">Client Purchases</h3>
          <div className="space-y-6">
            {orders.map((ord) => (
              <div key={ord.id} className="border border-brand-beige-dark/20 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-brand-blush-dark">{ord.id}</span>
                  <span className="text-[10px] text-brand-charcoal/40 dark:text-brand-cream/40 font-bold uppercase">{ord.date}</span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold">Recipient:</span> {ord.shippingAddress.name} ({ord.shippingAddress.city})
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold">Total: ₹{ord.totalPrice}</span>
                  <span className="bg-brand-blush text-brand-charcoal text-[9px] uppercase font-bold px-2 py-1 rounded-md">
                    {ord.orderStatus}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-xs text-brand-charcoal/50 text-center py-6">No recent purchases found.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB: Coupon Creation and lists */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Create coupon form */}
          <div className="lg:col-span-1 bg-white dark:bg-brand-charcoal/20 p-6 rounded-2xl border border-brand-beige-dark/15">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider mb-4 border-b border-brand-beige-dark/10 pb-3">Create Coupon</h3>
            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EXTRA20"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                >
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="fixed">Fixed Amount Discount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Discount Value</label>
                <input
                  type="number"
                  required
                  value={newVal}
                  onChange={(e) => setNewVal(Number(e.target.value))}
                  className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                />
              </div>

              <button type="submit" className="w-full bg-brand-charcoal text-white text-xs font-semibold py-3 rounded-lg uppercase tracking-widest hover:bg-brand-blush-dark transition">
                Create Code
              </button>
            </form>
          </div>

          {/* Coupon Codes grid list */}
          <div className="lg:col-span-2 bg-white dark:bg-brand-charcoal/20 p-6 rounded-2xl border border-brand-beige-dark/15">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider mb-4 border-b border-brand-beige-dark/10 pb-3">Active Coupons</h3>
            <div className="space-y-3">
              {coupons.map((c, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-brand-beige-dark/10 text-xs bg-brand-cream-light dark:bg-brand-charcoal/40">
                  <div>
                    <span className="font-bold text-brand-charcoal dark:text-white tracking-widest">{c.code}</span>
                    <span className="text-[10px] ml-4 text-brand-charcoal/50 dark:text-brand-cream/50">
                      Discount: {c.discountType === 'percentage' ? `${c.value}%` : `₹${c.value}`}
                    </span>
                  </div>
                  <button onClick={() => handleRemoveCoupon(c.code)} className="text-red-500 hover:text-red-700 p-2"><FiTrash2 /></button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
      {/* Product Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-brand-charcoal w-full max-w-2xl rounded-3xl border border-brand-beige-dark/20 p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-brand-beige-dark/10 pb-4">
              <h3 className="font-serif text-lg font-bold text-brand-charcoal dark:text-white">
                {editingProduct ? 'Edit Fashion Product' : 'Add New Fashion Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-brand-charcoal/50 dark:text-brand-cream/50 hover:text-brand-charcoal dark:hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs text-brand-charcoal/80 dark:text-brand-cream/80">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Product Name</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Brand</label>
                  <input
                    type="text"
                    required
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Description</label>
                <textarea
                  required
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Discount Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="None"
                    value={prodDiscountPrice || ''}
                    onChange={(e) => setProdDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Inventory Stock</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Available Sizes</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => {
                      const selected = prodSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setProdSizes(prodSizes.filter(s => s !== sz));
                            } else {
                              setProdSizes([...prodSizes, sz]);
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-md border font-semibold text-[10px] transition ${selected ? 'bg-brand-charcoal text-white border-brand-charcoal dark:bg-brand-cream dark:text-brand-charcoal' : 'border-brand-beige-dark/30 dark:border-brand-beige-dark/20 text-brand-charcoal/70 dark:text-brand-cream/70 hover:border-brand-charcoal/60'}`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Colors (comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blush Pink, Lavender, Ivory White"
                  value={prodColorsInput}
                  onChange={(e) => setProdColorsInput(e.target.value)}
                  className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                />
              </div>
              {/* Product Images Manager */}
              <div className="space-y-3">
                <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50">
                  Product Images ({prodImages.length})
                </label>

                {/* Images Preview Grid */}
                {prodImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl border border-brand-beige-dark/20 bg-brand-cream-light/30 dark:bg-brand-charcoal/30">
                    {prodImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-brand-beige-dark/30 group bg-white dark:bg-brand-charcoal">
                        <img
                          src={img}
                          alt={`Product image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setProdImages(prodImages.filter((_, i) => i !== idx))}
                            className="bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 hover:scale-110 transition shadow-lg"
                            title="Remove image"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {img.startsWith('data:') && (
                          <div className="absolute bottom-1 right-1 bg-brand-charcoal/80 dark:bg-brand-cream/80 text-white dark:text-brand-charcoal text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wide">
                            BASE64
                          </div>
                        )}
                        <div className="absolute top-1 left-1 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload and URL input panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Zone */}
                  <div className="relative">
                    <label
                      className={`h-36 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer p-4 transition text-center
                        ${isUploading
                          ? 'border-brand-beige-dark/30 bg-brand-cream-light/10 cursor-not-allowed'
                          : 'border-brand-beige-dark/50 hover:border-brand-blush-dark hover:bg-brand-cream-light/20 bg-brand-cream-light/30 dark:bg-brand-charcoal/30'}`}
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={isUploading}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {isUploading ? (
                        <>
                          <FiLoader className="w-8 h-8 text-brand-blush-dark animate-spin mb-2" />
                          <span className="font-semibold text-brand-charcoal/70 dark:text-brand-cream/70">Processing & uploading images...</span>
                        </>
                      ) : (
                        <>
                          <FiUpload className="w-8 h-8 text-brand-charcoal/40 dark:text-brand-cream/40 mb-2" />
                          <span className="font-bold text-brand-charcoal dark:text-brand-cream">Upload Image Files</span>
                          <span className="text-[10px] text-brand-charcoal/50 dark:text-brand-cream/50 mt-1">Drag & drop or click to browse (JPG, PNG, WEBP)</span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Add by URL Input */}
                  <div className="flex flex-col justify-between p-4 rounded-2xl border border-brand-beige-dark/20 bg-brand-cream-light/30 dark:bg-brand-charcoal/30">
                    <div className="space-y-1">
                      <span className="font-bold text-brand-charcoal dark:text-brand-cream">Add External Image URL</span>
                      <p className="text-[10px] text-brand-charcoal/50 dark:text-brand-cream/50">Paste a direct image link from the web.</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={singleImageUrlInput}
                        onChange={(e) => setSingleImageUrlInput(e.target.value)}
                        className="flex-1 bg-white dark:bg-brand-charcoal/60 px-3 py-2 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="bg-brand-charcoal text-white dark:bg-brand-cream dark:text-brand-charcoal px-4 py-2 rounded-lg font-bold hover:bg-brand-blush-dark dark:hover:bg-brand-blush transition hover:text-white shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Badges and collections checklist */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-2">Product Badges / Promoted Collections</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-brand-beige-dark/20 bg-brand-cream-light/30 dark:bg-brand-charcoal/30">
                  <label className="flex items-center gap-2 font-semibold select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodFeatured}
                      onChange={(e) => setProdFeatured(e.target.checked)}
                      className="rounded border-brand-beige-dark text-brand-blush focus:ring-brand-blush"
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 font-semibold select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodTrending}
                      onChange={(e) => setProdTrending(e.target.checked)}
                      className="rounded border-brand-beige-dark text-brand-blush focus:ring-brand-blush"
                    />
                    Trending
                  </label>
                  <label className="flex items-center gap-2 font-semibold select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodBestSeller}
                      onChange={(e) => setProdBestSeller(e.target.checked)}
                      className="rounded border-brand-beige-dark text-brand-blush focus:ring-brand-blush"
                    />
                    Best Seller
                  </label>
                  <label className="flex items-center gap-2 font-semibold select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodNewArrival}
                      onChange={(e) => setProdNewArrival(e.target.checked)}
                      className="rounded border-brand-beige-dark text-brand-blush focus:ring-brand-blush"
                    />
                    New Arrival
                  </label>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-3 border-t border-brand-beige-dark/10 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-brand-cream-light dark:bg-brand-charcoal px-6 py-2.5 rounded-lg border border-brand-beige-dark/40 font-semibold hover:bg-brand-beige/25 transition dark:text-brand-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-charcoal text-white dark:bg-brand-cream dark:text-brand-charcoal px-8 py-2.5 rounded-lg font-bold hover:bg-brand-blush-dark dark:hover:bg-brand-blush hover:text-white transition"
                >
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
