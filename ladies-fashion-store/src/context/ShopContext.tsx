import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { toast } from 'react-toastify';

// Define Interfaces
export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand: string;
  color: string[];
  sizes: string[];
  images: string[];
  stock: number;
  rating: number;
  reviews: Review[];
  featured: boolean;
  trending: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  createdDate: string;
  occasion?: string;
}

export interface CartItem {
  id: string; // unique for item + size + color combo
  productId: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend?: number;
}

export interface Order {
  id: string;
  date: string;
  products: {
    productId: number;
    name: string;
    image: string;
    quantity: number;
    price: number;
    selectedSize: string;
    selectedColor: string;
  }[];
  totalPrice: number;
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

interface ShopContextType {
  products: Product[];
  categories: string[];
  cart: CartItem[];
  wishlist: number[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Product[];
  user: any | null;
  setUser: (user: any) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  recentlyViewed: number[];
  addToRecentlyViewed: (id: number) => void;
  addToCart: (productId: number, size: string, color: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
  addReview: (productId: number, rating: number, comment: string, userName: string) => Promise<void>;
  activeCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  coupons: Coupon[];
  addCoupon: (code: string, discountType: 'percentage' | 'fixed', value: number, minSpend?: number) => Promise<{ success: boolean; message: string }>;
  deleteCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  orders: Order[];
  placeOrder: (shippingAddress: any, paymentMethod: string) => Promise<Order | null>;
  getCartTotal: () => number;
  getDiscountedTotal: () => number;
  getCartCount: () => number;
  seedDatabase: () => Promise<{ success: boolean; message: string }>;
  loadData: (userId?: string) => Promise<void>;
  createProduct: (productDetails: Omit<Product, 'id' | 'rating' | 'reviews' | 'createdDate'>) => Promise<{ success: boolean; message: string }>;
  updateProduct: (productId: number, productDetails: Partial<Product>) => Promise<{ success: boolean; message: string }>;
  deleteProduct: (productId: number) => Promise<{ success: boolean; message: string }>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Premium Seed Products
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Ethereal Rose Silk Saree",
    description: "Handwoven from pure mulberry silk, this elegant saree features intricate floral gold zari borders. The soft blush pink tone reflects feminine grace, perfect for weddings, high-tea parties, and festive celebrations. Comes with an unstitched matching blouse piece.",
    price: 180,
    discountPrice: 149,
    category: "Sarees",
    brand: "Dresiq Heritage",
    color: ["Blush Pink", "Soft Gold"],
    sizes: ["One Size"],
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1610030470298-40b3558c4f39?w=1000&auto=format&fit=crop&q=80"
    ],
    stock: 8,
    rating: 4.8,
    reviews: [],
    featured: true,
    trending: true,
    bestSeller: true,
    newArrival: false,
    createdDate: "2026-05-01",
    occasion: "Wedding Collection"
  },
  {
    id: 2,
    name: "Classic Lavender Linen Kurti",
    description: "Crafted from breathable premium organic linen, this minimalist A-line kurti features keyhole neck styling, subtle lace details at the cuffs, and a flowy silhouette. Perfect for comfortable daily office wear and casual evening strolls.",
    price: 49,
    category: "Kurtis",
    brand: "Loom & Petal",
    color: ["Lavender", "Off-White"],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1608748010899-18f300247112?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&auto=format&fit=crop&q=80"
    ],
    stock: 15,
    rating: 4.5,
    reviews: [],
    featured: false,
    trending: true,
    bestSeller: false,
    newArrival: true,
    createdDate: "2026-06-02",
    occasion: "Office Wear"
  },
  {
    id: 3,
    name: "Opulent Pastel Georgette Gown",
    description: "A showstopping floor-length gown featuring a pleated sweetheart bodice, delicate semi-sheer bishop sleeves, and a tiered flared skirt. Its rich lavender-cream tone matches beautifully with delicate diamond jewelry for gala events.",
    price: 240,
    discountPrice: 199,
    category: "Gowns",
    brand: "Chiffon Atelier",
    color: ["Lavender-Cream", "Blush Pink"],
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80"
    ],
    stock: 5,
    rating: 4.9,
    reviews: [],
    featured: true,
    trending: false,
    bestSeller: true,
    newArrival: false,
    createdDate: "2026-04-10",
    occasion: "Party Wear"
  },
  {
    id: 4,
    name: "Summer Meadow Chiffon Maxi",
    description: "An elegant, lightweight western summer dress printed with watercolor floral patterns. Featuring an adjustable wrap waistband, tiered hemline, and delicate flutter sleeves, it gives an effortlessly chic styling.",
    price: 89,
    discountPrice: 75,
    category: "Western Wear",
    brand: "Rive Gauche",
    color: ["Sage Green", "Blush Pink", "Beige-Floral"],
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80"
    ],
    stock: 22,
    rating: 4.4,
    reviews: [],
    featured: true,
    trending: true,
    bestSeller: false,
    newArrival: true,
    createdDate: "2026-06-10",
    occasion: "Casual Wear"
  },
  {
    id: 5,
    name: "Blush Pink Embroidered Kurta Set",
    description: "An elegant ethnic ensemble featuring a silk-blend straight kurta with refined hand-embroidered resham and thread work on the yoke, paired with comfortable matching straight pants and an organza dupatta.",
    price: 130,
    discountPrice: 110,
    category: "Ethnic Wear",
    brand: "Dresiq Heritage",
    color: ["Blush Pink"],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80"
    ],
    stock: 12,
    rating: 4.7,
    reviews: [],
    featured: false,
    trending: true,
    bestSeller: true,
    newArrival: false,
    createdDate: "2026-05-15",
    occasion: "Wedding Collection"
  },
  {
    id: 6,
    name: "Sleek Beige Blazer Set",
    description: "Tailored to perfection, this classic single-breasted blazer and trousers set in premium beige offers a sophisticated sharp silhouette. Made with breathable lightweight fabric for all-day comfort.",
    price: 159,
    category: "Office Wear",
    brand: "Tailored Grace",
    color: ["Beige", "Cream"],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80"
    ],
    stock: 10,
    rating: 4.6,
    reviews: [],
    featured: true,
    trending: false,
    bestSeller: false,
    newArrival: true,
    createdDate: "2026-06-22",
    occasion: "Office Wear"
  },
  {
    id: 7,
    name: "Embroidered Organza Wedding Lehenga",
    description: "Make a breathtaking entrance in this pastel ivory lehenga made of fine organza. Richly embellished with silver thread embroidery, glass beads, and sequins, it is paired with a heavy blouse and scalloped dupatta.",
    price: 450,
    discountPrice: 380,
    category: "Wedding Collection",
    brand: "Chiffon Atelier",
    color: ["Cream/Ivory", "Soft Gold"],
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80"
    ],
    stock: 3,
    rating: 5.0,
    reviews: [],
    featured: true,
    trending: true,
    bestSeller: false,
    newArrival: true,
    createdDate: "2026-06-25",
    occasion: "Wedding Collection"
  },
  {
    id: 8,
    name: "Pastel Lavender Cotton Sundress",
    description: "An ultra-casual tiered dress made of 100% combed cotton, detailed with a smocked bodice and tying shoulder straps. Its romantic lavender tone keeps you looking cool and fashionable all summer.",
    price: 65,
    discountPrice: 49,
    category: "Casual Wear",
    brand: "Loom & Petal",
    color: ["Lavender", "Blush Pink"],
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80"
    ],
    stock: 30,
    rating: 4.3,
    reviews: [],
    featured: false,
    trending: true,
    bestSeller: true,
    newArrival: false,
    createdDate: "2026-05-18",
    occasion: "Casual Wear"
  }
];

const mockCategories = [
  "Sarees",
  "Kurtis",
  "Lehengas",
  "Western Wear",
  "Cotton Wear",
  "Casual Wear"
];


export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories] = useState<string[]>(mockCategories);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return false;
  });
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Mapping DB snake_case columns to camelCase React properties
  const mapDBProduct = (dbProd: any): Product => ({
    id: dbProd.id,
    name: dbProd.name,
    description: dbProd.description,
    price: Number(dbProd.price),
    discountPrice: dbProd.discount_price ? Number(dbProd.discount_price) : undefined,
    category: dbProd.category,
    brand: dbProd.brand,
    color: dbProd.color || [],
    sizes: dbProd.sizes || [],
    images: dbProd.images || [],
    stock: dbProd.stock || 0,
    rating: Number(dbProd.rating) || 5.0,
    reviews: [],
    featured: dbProd.featured || false,
    trending: dbProd.trending || false,
    bestSeller: dbProd.best_seller || false,
    newArrival: dbProd.new_arrival || false,
    createdDate: dbProd.created_at?.split('T')[0] || ''
  });

  // Load database items from Supabase
  const loadData = async (userId?: string) => {
    try {
      const { data: dbProds, error: prodErr } = await supabase.from('products').select('*');
      let loadedProducts: Product[] = [];

      if (prodErr) {
        console.error("Products table query error:", prodErr);
        if (prodErr.code === '42P01') {
          toast.warning("Supabase tables not found. Please run the SQL queries in 'supabase_schema.sql' inside your SQL Editor! 🛠️", {
            toastId: 'missing-tables-warn',
            autoClose: 10000
          });
        }
      } else if (dbProds && dbProds.length > 0) {
        const { data: dbRevs } = await supabase.from('reviews').select('*');
        loadedProducts = dbProds.map((dbProd: any) => {
          const prod = mapDBProduct(dbProd);
          if (dbRevs) {
            prod.reviews = dbRevs
              .filter((r: any) => r.product_id === prod.id)
              .map((r: any) => ({
                id: String(r.id),
                userName: r.user_name,
                rating: r.rating,
                comment: r.comment,
                date: r.created_at?.split('T')[0] || ''
              }));
          }
          return prod;
        });
        setProducts(loadedProducts);
      } else {
        setProducts([]);
      }

      if (userId) {
        // Load User's Cart
        const { data: dbCart, error: cartErr } = await supabase.from('carts').select('*').eq('user_id', userId);
        if (cartErr) {
          console.error("Error loading cart:", cartErr);
          if (cartErr.code === '42P01') {
            toast.error("Carts table not found. Make sure you ran the SQL schema.", { toastId: 'missing-cart-warn' });
          }
        } else if (dbCart) {
          setCart(dbCart.map((c: any) => ({
            id: c.id,
            productId: c.product_id,
            quantity: c.quantity,
            selectedSize: c.selected_size,
            selectedColor: c.selected_color
          })));
        }

        // Load User's Wishlist
        const { data: dbWish, error: wishErr } = await supabase.from('wishlists').select('product_id').eq('user_id', userId);
        if (wishErr) {
          console.error("Error loading wishlist:", wishErr);
        } else if (dbWish) {
          setWishlist(dbWish.map((w: any) => w.product_id));
        }

        // Load User's Orders
        const { data: dbOrders, error: orderErr } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', userId);
        if (orderErr) {
          console.error("Error loading orders:", orderErr);
        } else if (dbOrders) {
          setOrders(dbOrders.map((o: any) => ({
            id: o.id,
            date: o.created_at?.split('T')[0] || '',
            totalPrice: Number(o.total_price),
            shippingAddress: o.shipping_address,
            paymentMethod: o.payment_method,
            paymentStatus: o.payment_status,
            orderStatus: o.order_status,
            products: o.order_items.map((oi: any) => {
              const p = loadedProducts.find(prod => prod.id === oi.product_id);
              return {
                productId: oi.product_id,
                name: p?.name || 'Luxury Fashion Item',
                image: p?.images[0] || '',
                quantity: oi.quantity,
                price: Number(oi.price),
                selectedSize: oi.selected_size,
                selectedColor: oi.selected_color
              };
            })
          })));
        }
      }

      // Load Coupons (available to authenticated sessions)
      const { data: dbCoupons, error: coupErr } = await supabase.from('coupons').select('*');
      if (!coupErr && dbCoupons) {
        setCoupons(dbCoupons.map((c: any) => ({
          code: c.code,
          discountType: c.discount_type,
          value: Number(c.value),
          minSpend: c.min_spend ? Number(c.min_spend) : undefined
        })));
      }
    } catch (err) {
      console.error("Error fetching Supabase database records:", err);
    }
  };

  // Seeding local catalog products directly to user's Supabase instance
  const seedDatabase = async () => {
    try {
      const { data: existing } = await supabase.from('products').select('id');
      if (existing && existing.length > 0) {
        return { success: false, message: "Catalog already seeded." };
      }

      const seedData = mockProducts.map(p => ({
        name: p.name,
        description: p.description,
        price: p.price,
        discount_price: p.discountPrice || null,
        category: p.category,
        brand: p.brand,
        color: p.color,
        sizes: p.sizes,
        images: p.images,
        stock: p.stock,
        rating: p.rating,
        featured: p.featured,
        trending: p.trending,
        best_seller: p.bestSeller,
        new_arrival: p.newArrival
      }));

      const { error } = await supabase.from('products').insert(seedData);
      if (error) throw error;

      await loadData();
      return { success: true, message: "Luxury catalog seeded to Supabase successfully! ✨" };
    } catch (err: any) {
      console.error("Failed seeding database:", err);
      return { success: false, message: err.message };
    }
  };

  // Product management actions for Admins
  const createProduct = async (productDetails: Omit<Product, 'id' | 'rating' | 'reviews' | 'createdDate'>) => {
    try {
      const dbData = {
        name: productDetails.name,
        description: productDetails.description,
        price: productDetails.price,
        discount_price: productDetails.discountPrice || null,
        category: productDetails.category,
        brand: productDetails.brand,
        color: productDetails.color,
        sizes: productDetails.sizes,
        images: productDetails.images,
        stock: productDetails.stock,
        rating: 5.0,
        featured: productDetails.featured,
        trending: productDetails.trending,
        best_seller: productDetails.bestSeller,
        new_arrival: productDetails.newArrival
      };

      const { error } = await supabase.from('products').insert(dbData);
      if (error) throw error;
      await loadData(user?.id);
      return { success: true, message: "Product created successfully! ✨" };
    } catch (err: any) {
      console.error("Failed creating product:", err);
      return { success: false, message: err.message };
    }
  };

  const updateProduct = async (productId: number, productDetails: Partial<Product>) => {
    try {
      const dbData: any = {};
      if (productDetails.name !== undefined) dbData.name = productDetails.name;
      if (productDetails.description !== undefined) dbData.description = productDetails.description;
      if (productDetails.price !== undefined) dbData.price = productDetails.price;
      if (productDetails.discountPrice !== undefined) dbData.discount_price = productDetails.discountPrice;
      if (productDetails.category !== undefined) dbData.category = productDetails.category;
      if (productDetails.brand !== undefined) dbData.brand = productDetails.brand;
      if (productDetails.color !== undefined) dbData.color = productDetails.color;
      if (productDetails.sizes !== undefined) dbData.sizes = productDetails.sizes;
      if (productDetails.images !== undefined) dbData.images = productDetails.images;
      if (productDetails.stock !== undefined) dbData.stock = productDetails.stock;
      if (productDetails.featured !== undefined) dbData.featured = productDetails.featured;
      if (productDetails.trending !== undefined) dbData.trending = productDetails.trending;
      if (productDetails.bestSeller !== undefined) dbData.best_seller = productDetails.bestSeller;
      if (productDetails.newArrival !== undefined) dbData.new_arrival = productDetails.newArrival;

      const { error } = await supabase.from('products').update(dbData).eq('id', productId);
      if (error) throw error;
      await loadData(user?.id);
      return { success: true, message: "Product updated successfully! 💫" };
    } catch (err: any) {
      console.error("Failed updating product:", err);
      return { success: false, message: err.message };
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      await loadData(user?.id);
      return { success: true, message: "Product deleted successfully! 🗑️" };
    } catch (err: any) {
      console.error("Failed deleting product:", err);
      return { success: false, message: err.message };
    }
  };

  // Auth synchronization listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email || '');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setCart([]);
        setWishlist([]);
        setOrders([]);
      }
    });

    // Default load products (no auth needed)
    loadData();

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (uid: string, email: string) => {
    try {
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (!profile) {
        // Fallback create profile inside table
        const newProf = {
          id: uid,
          name: email.split('@')[0],
          phone: '',
          address: '',
          role: email === 'admin@dresiq.com' ? 'admin' : 'user'
        };
        await supabase.from('profiles').insert(newProf);
        profile = newProf;
      }

      setUser({
        id: uid,
        name: profile.name,
        email: email,
        phone: profile.phone || '',
        address: profile.address || '',
        role: profile.role || 'user'
      });

      // Fetch dynamic tables loaded with this user ID
      loadData(uid);
    } catch (err) {
      console.error("Error loading user profile:", err);
    }
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Sync dark mode class and localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Handle Search Filtering
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
    } else {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [searchQuery, products]);

  const addToRecentlyViewed = (id: number) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(pId => pId !== id);
      return [id, ...filtered].slice(0, 5);
    });
  };

  // Cart operations (Persisted in Supabase if user exists)
  const addToCart = async (productId: number, size: string, color: string, quantity = 1) => {
    if (user?.id) {
      const cartItemId = `${user.id}-${productId}-${size}-${color}`;

      const { data: exist, error: selectErr } = await supabase
        .from('carts')
        .select('*')
        .eq('id', cartItemId)
        .maybeSingle();

      if (selectErr) {
        console.error("Select cart error:", selectErr);
        toast.error(`Database Select Error: ${selectErr.message}`);
        return;
      }

      if (exist) {
        const { error: updateErr } = await supabase
          .from('carts')
          .update({ quantity: exist.quantity + quantity })
          .eq('id', cartItemId);
        if (updateErr) {
          console.error("Update cart error:", updateErr);
          toast.error(`Database Update Error: ${updateErr.message}`);
        }
      } else {
        const { error: insertErr } = await supabase
          .from('carts')
          .insert({
            id: cartItemId,
            user_id: user.id,
            product_id: productId,
            quantity,
            selected_size: size,
            selected_color: color
          });
        if (insertErr) {
          console.error("Insert cart error:", insertErr);
          toast.error(`Database Insert Error: ${insertErr.message}`);
        }
      }
      await loadData(user.id);
    } else {
      // Guest fallback
      const cartItemId = `${productId}-${size}-${color}`;
      setCart(prev => {
        const existIndex = prev.findIndex(item => item.id === cartItemId);
        if (existIndex > -1) {
          const updated = [...prev];
          updated[existIndex].quantity += quantity;
          return updated;
        }
        return [...prev, { id: cartItemId, productId, quantity, selectedSize: size, selectedColor: color }];
      });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (user?.id) {
      const { error } = await supabase.from('carts').delete().eq('id', cartItemId);
      if (error) {
        console.error("Remove cart error:", error);
        toast.error(`Database Delete Error: ${error.message}`);
      }
      await loadData(user.id);
    } else {
      setCart(prev => prev.filter(item => item.id !== cartItemId));
    }
  };

  const updateCartQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    if (user?.id) {
      const { error } = await supabase.from('carts').update({ quantity }).eq('id', cartItemId);
      if (error) {
        console.error("Update quantity error:", error);
        toast.error(`Database Update Error: ${error.message}`);
      }
      await loadData(user.id);
    } else {
      setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity } : item));
    }
  };

  const clearCart = async () => {
    if (user?.id) {
      const { error } = await supabase.from('carts').delete().eq('user_id', user.id);
      if (error) {
        console.error("Clear cart error:", error);
        toast.error(`Database Clear Error: ${error.message}`);
      }
      await loadData(user.id);
    } else {
      setCart([]);
    }
  };

  // Wishlist toggle (Persisted in Supabase if logged in)
  const toggleWishlist = async (productId: number) => {
    if (user?.id) {
      if (wishlist.includes(productId)) {
        const { error } = await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
        if (error) {
          console.error("Remove wishlist error:", error);
          toast.error(`Database Wishlist Delete Error: ${error.message}`);
        }
      } else {
        const { error } = await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
        if (error) {
          console.error("Add wishlist error:", error);
          toast.error(`Database Wishlist Insert Error: ${error.message}`);
        }
      }
      await loadData(user.id);
    } else {
      setWishlist(prev => {
        if (prev.includes(productId)) {
          return prev.filter(id => id !== productId);
        }
        return [...prev, productId];
      });
    }
  };

  // Add Product Review (Persisted in Supabase)
  const addReview = async (productId: number, rating: number, comment: string, userName = "Anonymous") => {
    try {
      await supabase.from('reviews').insert({
        product_id: productId,
        user_name: userName,
        rating,
        comment
      });

      // Load new ratings
      await loadData(user?.id);
    } catch (err) {
      console.error("Failed adding review in database:", err);
    }
  };

  // Apply Coupon
  const applyCoupon = (code: string) => {
    const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!found) {
      return { success: false, message: "Invalid Coupon Code" };
    }
    const total = getCartTotal();
    if (found.minSpend && total < found.minSpend) {
      return { success: false, message: `Minimum spend of ₹${found.minSpend} required.` };
    }
    setActiveCoupon(found);
    return { success: true, message: `Coupon applied: ₹${found.value}${found.discountType === 'percentage' ? '%' : ''} off!` };
  };

  const removeCoupon = () => setActiveCoupon(null);

  const addCoupon = async (code: string, discountType: 'percentage' | 'fixed', value: number, minSpend?: number) => {
    try {
      const { error } = await supabase.from('coupons').insert({
        code: code.toUpperCase(),
        discount_type: discountType,
        value,
        min_spend: minSpend || null
      });
      if (error) throw error;
      await loadData(user?.id);
      return { success: true, message: "Coupon created!" };
    } catch (err: any) {
      console.error("Failed adding coupon in database:", err);
      return { success: false, message: err.message };
    }
  };

  const deleteCoupon = async (code: string) => {
    try {
      const { error } = await supabase.from('coupons').delete().eq('code', code.toUpperCase());
      if (error) throw error;
      await loadData(user?.id);
      return { success: true, message: "Coupon deleted!" };
    } catch (err: any) {
      console.error("Failed deleting coupon in database:", err);
      return { success: false, message: err.message };
    }
  };

  // Cart helper calculations
  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) return sum;
      const actualPrice = prod.discountPrice || prod.price;
      return sum + (actualPrice * item.quantity);
    }, 0);
  };

  const getDiscountedTotal = () => {
    const total = getCartTotal();
    if (!activeCoupon) return total;
    if (activeCoupon.discountType === 'percentage') {
      return total - (total * activeCoupon.value / 100);
    }
    return Math.max(0, total - activeCoupon.value);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Place Order (Persisted in Supabase)
  const placeOrder = async (shippingAddress: any, paymentMethod: string): Promise<Order | null> => {
    if (cart.length === 0) return null;

    try {
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const finalPrice = getDiscountedTotal();

      const newOrder = {
        id: orderId,
        user_id: user?.id || null,
        total_price: finalPrice,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'COD' ? 'Pending' : 'Paid',
        order_status: 'Processing'
      };

      // 1. Create order
      const { error: orderErr } = await supabase.from('orders').insert(newOrder);
      if (orderErr) throw orderErr;

      // 2. Create order items
      const items = cart.map(item => {
        const prod = products.find(p => p.id === item.productId)!;
        return {
          order_id: orderId,
          product_id: item.productId,
          quantity: item.quantity,
          price: prod.discountPrice || prod.price,
          selected_size: item.selectedSize,
          selected_color: item.selectedColor
        };
      });

      const { error: itemsErr } = await supabase.from('order_items').insert(items);
      if (itemsErr) throw itemsErr;

      // 3. Deduct product stocks & clear cart
      for (const item of cart) {
        const prod = products.find(p => p.id === item.productId)!;
        await supabase
          .from('products')
          .update({ stock: Math.max(0, prod.stock - item.quantity) })
          .eq('id', item.productId);
      }

      await clearCart();
      setActiveCoupon(null);
      await loadData(user?.id);

      // Return local confirmation order format
      return {
        id: orderId,
        date: new Date().toISOString().split('T')[0],
        totalPrice: finalPrice,
        shippingAddress,
        paymentMethod,
        paymentStatus: newOrder.payment_status as any,
        orderStatus: newOrder.order_status as any,
        products: items.map(oi => ({
          productId: oi.product_id,
          name: products.find(p => p.id === oi.product_id)?.name || 'Luxury Fashion Item',
          image: products.find(p => p.id === oi.product_id)?.images[0] || '',
          quantity: oi.quantity,
          price: oi.price,
          selectedSize: oi.selected_size,
          selectedColor: oi.selected_color
        }))
      };
    } catch (err) {
      console.error("Failed placing order in database:", err);
      return null;
    }
  };

  return (
    <ShopContext.Provider value={{
      products,
      categories,
      cart,
      wishlist,
      searchQuery,
      setSearchQuery,
      searchResults,
      user,
      setUser,
      darkMode,
      toggleDarkMode,
      recentlyViewed,
      addToRecentlyViewed,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      addReview,
      activeCoupon,
      applyCoupon,
      removeCoupon,
      coupons,
      addCoupon,
      deleteCoupon,
      orders,
      placeOrder,
      getCartTotal,
      getDiscountedTotal,
      getCartCount,
      seedDatabase,
      loadData,
      createProduct,
      updateProduct,
      deleteProduct
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
