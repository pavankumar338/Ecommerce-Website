import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { toast } from 'react-toastify';
import {
  FiDollarSign, FiShoppingBag, FiUsers,
  FiPlus, FiLoader
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
  const { user, orders } = useShop();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Configuration options states
  const [configDressTypes, setConfigDressTypes] = useState<any[]>([]);
  const [configFabrics, setConfigFabrics] = useState<any[]>([]);
  const [configDesigns, setConfigDesigns] = useState<any[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Unified Config Modal states
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configModalType, setConfigModalType] = useState<'dressType' | 'fabric' | 'design'>('dressType');
  const [editingConfigItem, setEditingConfigItem] = useState<any | null>(null);

  // Form states for config items
  const [cfgName, setCfgName] = useState('');
  const [cfgPrice, setCfgPrice] = useState(0);
  const [cfgImageUrl, setCfgImageUrl] = useState('');
  const [cfgDescription, setCfgDescription] = useState('');
  const [isCfgUploading, setIsCfgUploading] = useState(false);

  const fetchConfigItems = async () => {
    setLoadingConfig(true);
    try {
      const { data: dt } = await supabase.from('custom_dress_types').select('*').order('id', { ascending: true });
      if (dt) {
        setConfigDressTypes(dt);
      }

      const { data: fb } = await supabase.from('custom_fabrics').select('*').order('id', { ascending: true });
      if (fb) {
        setConfigFabrics(fb);
      }

      const { data: ds } = await supabase.from('custom_designs').select('*').order('id', { ascending: true });
      if (ds) {
        setConfigDesigns(ds);
      }
    } catch (err) {
      console.error("Error fetching config items:", err);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'customConfig') {
      fetchConfigItems();
    }
  }, [activeTab]);

  const openAddConfigModal = (type: 'dressType' | 'fabric' | 'design') => {
    setConfigModalType(type);
    setEditingConfigItem(null);
    setCfgName(type === 'design' ? `Design #${configDesigns.length + 1}` : '');
    setCfgPrice(0);
    setCfgImageUrl('');
    setCfgDescription('');
    setIsConfigModalOpen(true);
  };

  const openEditConfigModal = (type: 'dressType' | 'fabric' | 'design', item: any) => {
    setConfigModalType(type);
    setEditingConfigItem(item);
    setCfgName(item.name);
    setCfgPrice(Number(item.price || 0));
    setCfgImageUrl(item.image_url || '');
    setCfgDescription(item.description || '');
    setIsConfigModalOpen(true);
  };

  const handleCfgFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCfgUploading(true);
    try {
      const file = files[0];
      const compressedBase64 = await compressImage(file);

      // Try uploading to Supabase Storage
      const blob = dataURLtoBlob(compressedBase64);
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `custom-config-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: true });

      if (error) {
        console.warn("Storage upload failed, fallback to base64:", error.message);
        setCfgImageUrl(compressedBase64);
        toast.info("Processed image locally! 💾");
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        setCfgImageUrl(publicUrlData.publicUrl);
        toast.success("Image uploaded successfully! 💫");
      }
    } catch (err) {
      console.error("Error processing config image upload:", err);
      toast.error("Error processing image file.");
    } finally {
      setIsCfgUploading(false);
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCfgUploading) {
      toast.warning("Please wait for the image upload to finish.");
      return;
    }
    if (!cfgImageUrl.trim()) {
      toast.error("Please provide or upload an image.");
      return;
    }

    const tableName =
      configModalType === 'dressType' ? 'custom_dress_types' :
        configModalType === 'fabric' ? 'custom_fabrics' : 'custom_designs';

    const payload: any = {
      name: cfgName,
      image_url: cfgImageUrl
    };

    if (configModalType === 'dressType') {
      payload.price = Number(cfgPrice);
      payload.description = cfgDescription;
    } else if (configModalType === 'fabric') {
      payload.price = Number(cfgPrice);
    }

    let error;
    if (editingConfigItem) {
      const { error: err } = await supabase
        .from(tableName)
        .update(payload)
        .eq('id', editingConfigItem.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from(tableName)
        .insert(payload);
      error = err;
    }

    if (error) {
      console.error("Error saving customization configuration:", error);
      toast.error(`Failed to save configuration: ${error.message}`);
    } else {
      toast.success("Customization configuration saved successfully! ✨");
      setIsConfigModalOpen(false);
      fetchConfigItems();
    }
  };

  const handleDeleteConfigItem = async (type: 'dressType' | 'fabric' | 'design', id: number) => {
    if (window.confirm("Are you sure you want to permanently delete this configuration option? 🗑️")) {
      const tableName =
        type === 'dressType' ? 'custom_dress_types' :
          type === 'fabric' ? 'custom_fabrics' : 'custom_designs';

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting configuration option:", error);
        toast.error(`Failed to delete option: ${error.message}`);
      } else {
        toast.success("Option deleted successfully. 🗑️");
        fetchConfigItems();
      }
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Page Header */}
      <div className="mb-12 border-b border-brand-beige-dark/15 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-charcoal dark:text-white">Management Concierge</h1>
          <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mt-1">Control metrics, custom designs, and orders.</p>
        </div>
        <div className="flex gap-2">
          {['overview', 'customConfig', 'orders'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs uppercase tracking-widest font-bold px-4 py-2.5 rounded-full transition ${activeTab === tab ? 'bg-brand-charcoal text-white dark:bg-brand-cream dark:text-brand-charcoal' : 'bg-white dark:bg-brand-charcoal/20 border border-brand-beige-dark/20 text-brand-charcoal dark:text-brand-cream'}`}
            >
              {tab === 'customConfig' ? 'Custom Products' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: Overview Stats */}
      {activeTab === 'overview' && (
        <div className="space-y-12">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

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

          </div>
        </div>
      )}

      {/* TAB: Customization Configuration options */}
      {activeTab === 'customConfig' && (
        <div className="space-y-12 animate-fadeIn">

          {/* A: Dress types */}
          <div className="bg-white dark:bg-brand-charcoal/20 p-8 rounded-2xl border border-brand-beige-dark/15">
            <div className="flex justify-between items-center border-b border-brand-beige-dark/10 pb-4 mb-6">
              <div>
                <h3 className="font-serif text-lg font-bold">Dress Types / Silhouettes</h3>
                <p className="text-[10px] text-brand-charcoal/50 dark:text-brand-cream/50 mt-1">Manage base styles (Kurti, Lehenga, etc.) that clients select first.</p>
              </div>
              <button
                onClick={() => openAddConfigModal('dressType')}
                className="bg-brand-charcoal text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 hover:bg-brand-blush-dark transition"
              >
                <FiPlus /> Add Dress Silhouette
              </button>
            </div>

            {loadingConfig ? (
              <div className="text-center py-12 flex justify-center items-center gap-2 text-xs text-brand-charcoal/50">
                <FiLoader className="animate-spin text-brand-blush-dark w-5 h-5" />
                <span>Loading silhouettes...</span>
              </div>
            ) : configDressTypes.length === 0 ? (
              <div className="text-center py-6 text-xs text-brand-charcoal/50">No silhouettes loaded. Seed database or click Add to create.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {configDressTypes.map((dt) => (
                  <div key={dt.id} className="group overflow-hidden rounded-2xl border border-brand-beige-dark/20 bg-white dark:bg-brand-charcoal/40 flex flex-col justify-between h-[300px]">
                    <div className="relative flex-1 overflow-hidden bg-brand-cream-light/30">
                      <img src={dt.image_url} alt={dt.name} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                    </div>
                    <div className="p-4 border-t border-brand-beige-dark/10 bg-transparent flex flex-col gap-1.5">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-serif font-bold text-xs truncate max-w-[70%]">{dt.name}</h4>
                        <span className="font-bold text-brand-blush-dark text-xs shrink-0">₹{dt.price}</span>
                      </div>
                      <p className="text-[10px] text-brand-charcoal/55 dark:text-brand-cream/55 truncate">{dt.description || 'No description provided'}</p>
                      <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-brand-beige-dark/10">
                        <button onClick={() => openEditConfigModal('dressType', dt)} className="p-1.5 hover:bg-brand-blush/30 rounded-lg text-brand-charcoal/60 dark:text-brand-cream/60 text-xs">Edit</button>
                        <button onClick={() => handleDeleteConfigItem('dressType', dt.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 text-xs">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* B: Fabrics */}
          <div className="bg-white dark:bg-brand-charcoal/20 p-8 rounded-2xl border border-brand-beige-dark/15">
            <div className="flex justify-between items-center border-b border-brand-beige-dark/10 pb-4 mb-6">
              <div>
                <h3 className="font-serif text-lg font-bold">Fabric prints & Materials</h3>
                <p className="text-[10px] text-brand-charcoal/50 dark:text-brand-cream/50 mt-1">Manage print designs, colors, textures, and fabric surcharges.</p>
              </div>
              <button
                onClick={() => openAddConfigModal('fabric')}
                className="bg-brand-charcoal text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 hover:bg-brand-blush-dark transition"
              >
                <FiPlus /> Add Material / Print
              </button>
            </div>

            {loadingConfig ? (
              <div className="text-center py-12 flex justify-center items-center gap-2 text-xs text-brand-charcoal/50">
                <FiLoader className="animate-spin text-brand-blush-dark w-5 h-5" />
                <span>Loading fabrics...</span>
              </div>
            ) : configFabrics.length === 0 ? (
              <div className="text-center py-6 text-xs text-brand-charcoal/50">No materials loaded.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {configFabrics.map((fb) => (
                  <div key={fb.id} className="group overflow-hidden rounded-xl border border-brand-beige-dark/20 bg-white dark:bg-brand-charcoal/40 flex flex-col justify-between h-[180px]">
                    <div className="relative flex-1 overflow-hidden bg-brand-cream-light/30">
                      <img src={fb.image_url} alt={fb.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 border-t border-brand-beige-dark/10 text-center bg-transparent flex flex-col gap-1">
                      <span className="text-[10px] font-bold truncate block">{fb.name}</span>
                      <span className="text-[9px] text-brand-charcoal/50 dark:text-brand-cream/50">+₹{fb.price}</span>
                      <div className="flex gap-1 justify-center mt-1 border-t border-brand-beige-dark/10 pt-1">
                        <button onClick={() => openEditConfigModal('fabric', fb)} className="text-[9px] font-semibold text-brand-charcoal/70 dark:text-brand-cream/70 hover:underline">Edit</button>
                        <span className="text-brand-beige-dark/40">|</span>
                        <button onClick={() => handleDeleteConfigItem('fabric', fb.id)} className="text-[9px] font-semibold text-red-500 hover:underline">Del</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* C: Stitching designs */}
          <div className="bg-white dark:bg-brand-charcoal/20 p-8 rounded-2xl border border-brand-beige-dark/15">
            <div className="flex justify-between items-center border-b border-brand-beige-dark/10 pb-4 mb-6">
              <div>
                <h3 className="font-serif text-lg font-bold">Stitching blueprint designs</h3>
                <p className="text-[10px] text-brand-charcoal/50 dark:text-brand-cream/50 mt-1">Manage neck designs, hand stitching options, and catalogs.</p>
              </div>
              <button
                onClick={() => openAddConfigModal('design')}
                className="bg-brand-charcoal text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 hover:bg-brand-blush-dark transition"
              >
                <FiPlus /> Add Design blueprint
              </button>
            </div>

            {loadingConfig ? (
              <div className="text-center py-12 flex justify-center items-center gap-2 text-xs text-brand-charcoal/50">
                <FiLoader className="animate-spin text-brand-blush-dark w-5 h-5" />
                <span>Loading designs...</span>
              </div>
            ) : configDesigns.length === 0 ? (
              <div className="text-center py-6 text-xs text-brand-charcoal/50">No design blueprints loaded.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {configDesigns.map((ds) => (
                  <div key={ds.id} className="group overflow-hidden rounded-xl border border-brand-beige-dark/20 bg-white dark:bg-brand-charcoal/40 flex flex-col justify-between h-[180px]">
                    <div className="relative flex-1 overflow-hidden bg-brand-cream-light/30">
                      <img src={ds.image_url} alt={ds.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 border-t border-brand-beige-dark/10 text-center bg-transparent flex flex-col gap-1">
                      <span className="text-[10px] font-bold truncate block">{ds.name}</span>
                      <div className="flex gap-1 justify-center mt-1 border-t border-brand-beige-dark/10 pt-1">
                        <button onClick={() => openEditConfigModal('design', ds)} className="text-[9px] font-semibold text-brand-charcoal/70 dark:text-brand-cream/70 hover:underline">Edit</button>
                        <span className="text-brand-beige-dark/40">|</span>
                        <button onClick={() => handleDeleteConfigItem('design', ds.id)} className="text-[9px] font-semibold text-red-500 hover:underline">Del</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB: Orders history status updates */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-brand-charcoal/20 p-8 rounded-2xl border border-brand-beige-dark/15 animate-fadeIn">
          <h3 className="font-serif text-lg font-bold border-b border-brand-beige-dark/10 pb-4 mb-6">Client Purchases</h3>
          <div className="space-y-6">
            {orders.map((ord) => (
              <div key={ord.id} className="border border-brand-beige-dark/20 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-brand-blush-dark">{ord.id}</span>
                  <span className="text-[10px] text-brand-charcoal/40 dark:text-brand-cream/40 font-bold uppercase">{ord.date}</span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold">Recipient:</span> {ord.shippingAddress?.name || 'N/A'} ({ord.shippingAddress?.city || 'N/A'})
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

      {/* Unified Customization Options Config Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-brand-charcoal w-full max-w-md rounded-3xl border border-brand-beige-dark/20 p-8 shadow-2xl space-y-6 relative font-sans">

            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-brand-beige-dark/10 pb-4">
              <h3 className="font-serif text-base font-bold text-brand-charcoal dark:text-white">
                {editingConfigItem ? 'Edit Option' : 'Add New Customization Option'}
                <span className="text-[10px] font-sans font-normal uppercase tracking-wider block text-brand-blush-dark mt-1">
                  Type: {configModalType === 'dressType' ? 'Silhouette' : configModalType === 'fabric' ? 'Fabric Print' : 'Design Pattern'}
                </span>
              </h3>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="text-brand-charcoal/50 dark:text-brand-cream/50 hover:text-brand-charcoal dark:hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfigSubmit} className="space-y-4 text-xs text-brand-charcoal/80 dark:text-brand-cream/80">

              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Option Name</label>
                <input
                  type="text"
                  required
                  placeholder={configModalType === 'design' ? 'e.g. Design #5' : 'e.g. Royal Silk, Anarkali'}
                  value={cfgName}
                  onChange={(e) => setCfgName(e.target.value)}
                  className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                />
              </div>

              {configModalType !== 'design' && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Price Surcharge (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={cfgPrice}
                    onChange={(e) => setCfgPrice(Number(e.target.value))}
                    className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                  />
                </div>
              )}

              {configModalType === 'dressType' && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Short Description</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Classic royal ethnic fusion gown..."
                    value={cfgDescription}
                    onChange={(e) => setCfgDescription(e.target.value)}
                    className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                  />
                </div>
              )}

              {/* Image upload and url fields */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50">Preview Image</label>

                {cfgImageUrl && (
                  <div className="relative w-32 aspect-square rounded-xl overflow-hidden border border-brand-beige-dark/30 bg-brand-cream-light/35">
                    <img src={cfgImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCfgImageUrl('')}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:scale-105 transition text-[8px] font-bold"
                    >
                      &times;
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2">
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer p-3 transition text-center min-h-[60px]
                    ${isCfgUploading ? 'border-brand-beige-dark/30 bg-brand-cream-light/10 cursor-not-allowed' : 'border-brand-beige-dark/50 hover:border-brand-blush-dark bg-brand-cream-light/30 dark:bg-brand-charcoal/30'}`}>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isCfgUploading}
                      onChange={handleCfgFileUpload}
                      className="hidden"
                    />
                    <span className="font-bold text-[10px] text-brand-charcoal dark:text-brand-cream">
                      {isCfgUploading ? 'Processing...' : 'Upload Image File'}
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Or paste external image URL..."
                      value={cfgImageUrl}
                      onChange={(e) => setCfgImageUrl(e.target.value)}
                      className="flex-1 bg-brand-cream-light dark:bg-brand-charcoal/40 px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                    />
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-3 border-t border-brand-beige-dark/10 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="bg-brand-cream-light dark:bg-brand-charcoal px-4 py-2 rounded-lg border border-brand-beige-dark/40 font-semibold hover:bg-brand-beige/25 transition dark:text-brand-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCfgUploading}
                  className="bg-brand-charcoal text-white dark:bg-brand-cream dark:text-brand-charcoal px-6 py-2 rounded-lg font-bold hover:bg-brand-blush-dark dark:hover:bg-brand-blush transition"
                >
                  {editingConfigItem ? 'Save Changes' : 'Create Option'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
