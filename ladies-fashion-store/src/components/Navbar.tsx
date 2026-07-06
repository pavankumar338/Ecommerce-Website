import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import {
  FiSearch, FiHeart, FiShoppingBag, FiUser,
  FiMenu, FiX, FiSun, FiMoon, FiChevronDown, FiArrowRight
} from 'react-icons/fi';

export const Navbar: React.FC = () => {
  const { cart, wishlist, searchQuery, setSearchQuery, searchResults, darkMode, toggleDarkMode, user, setUser } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchFocused(false);
    }
  };

  const handleSearchSuggestionClick = (prodId: number) => {
    setSearchQuery('');
    setSearchFocused(false);
    navigate(`/product/${prodId}`);
  };

  const handleLogout = () => {
    setUser(null);
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Burger Menu for Mobile */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark transition p-2"
              aria-label="Open menu"
            >
              <FiMenu className="h-6 w-6" />
            </button>
          </div>

          {/* Luxury Logo */}
          <div className="flex-1 flex justify-center md:justify-start">
            <Link to="/" className="flex items-center">
              <span className="font-serif text-2xl md:text-3xl font-bold tracking-widest text-brand-charcoal dark:text-brand-cream hover:opacity-85 transition">
                VIORA<span className="text-brand-blush-dark">.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-sm font-medium tracking-wider text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark dark:hover:text-brand-blush transition uppercase">Home</Link>
            <Link to="/shop" className="text-sm font-medium tracking-wider text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark dark:hover:text-brand-blush transition uppercase">Shop</Link>

            {/* Elegant Categories Dropdown */}
            <div className="relative group">
              <button className="flex items-center text-sm font-medium tracking-wider text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark dark:hover:text-brand-blush transition uppercase gap-1">
                Collections <FiChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute top-full -left-4 w-48 mt-2 py-2 glass rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <Link to="/shop?category=Kurtis" className="block px-4 py-2 text-xs font-medium tracking-wide hover:bg-brand-blush-light dark:hover:bg-brand-charcoal text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark">Kurtis</Link>
                <Link to="/shop?category=Cotton Wear" className="block px-4 py-2 text-xs font-medium tracking-wide hover:bg-brand-blush-light dark:hover:bg-brand-charcoal text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark">Cotton Wear</Link>
                <Link to="/shop?category=Wedding Collection" className="block px-4 py-2 text-xs font-medium tracking-wide hover:bg-brand-blush-light dark:hover:bg-brand-charcoal text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark">Wedding Collection</Link>
                <Link to="/shop?category=Western Wear" className="block px-4 py-2 text-xs font-medium tracking-wide hover:bg-brand-blush-light dark:hover:bg-brand-charcoal text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark">Western Wear</Link>
              </div>
            </div>

            <Link to="/about" className="text-sm font-medium tracking-wider text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark dark:hover:text-brand-blush transition uppercase">About</Link>
            <Link to="/contact" className="text-sm font-medium tracking-wider text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark dark:hover:text-brand-blush transition uppercase">Contact</Link>
          </nav>

          {/* Right Action Icons & Search */}
          <div className="flex-1 flex items-center justify-end space-x-6">

            {/* Search Input Panel */}
            <div className="relative hidden lg:block w-64">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-4 py-2 rounded-full border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream transition"
                />
                <button type="submit" className="absolute right-3 top-2.5 text-brand-charcoal/60 dark:text-brand-cream/60 hover:text-brand-blush-dark">
                  <FiSearch className="h-4 w-4" />
                </button>
              </form>

              {/* Instant Search Suggestions Box */}
              {searchFocused && searchQuery && (
                <div className="absolute top-full right-0 w-80 mt-2 glass rounded-lg shadow-xl overflow-hidden py-2 border border-brand-beige-dark/20 z-50">
                  <h4 className="px-4 py-1 text-[10px] font-bold text-brand-charcoal/50 dark:text-brand-cream/50 tracking-wider uppercase">Suggestions</h4>
                  {searchResults.length > 0 ? (
                    searchResults.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSearchSuggestionClick(p.id)}
                        className="flex items-center px-4 py-2 hover:bg-brand-blush-light dark:hover:bg-brand-charcoal cursor-pointer transition gap-3"
                      >
                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-md" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-brand-charcoal dark:text-brand-cream truncate">{p.name}</p>
                          <p className="text-[10px] text-brand-blush-dark font-medium">₹{p.discountPrice || p.price}</p>
                        </div>
                        <FiArrowRight className="h-3 w-3 text-brand-charcoal/40" />
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-2 text-xs text-brand-charcoal/60 dark:text-brand-cream/60">No products found</p>
                  )}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="relative text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark transition">
              <FiHeart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-blush-dark text-[9px] font-bold text-white w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="relative text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark transition">
              <FiShoppingBag className="h-5 w-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-blush-dark text-[9px] font-bold text-white w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark transition"
              >
                <FiUser className="h-5 w-5" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 w-48 mt-3 py-2 glass rounded-lg shadow-xl border border-brand-beige-dark/20 z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-brand-beige/20">
                        <p className="text-[10px] text-brand-charcoal/50 dark:text-brand-cream/50 uppercase font-semibold">Signed in as</p>
                        <p className="text-xs font-semibold text-brand-charcoal dark:text-brand-cream truncate">{user.name}</p>
                      </div>
                      <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2 text-xs text-brand-charcoal dark:text-brand-cream hover:bg-brand-blush-light dark:hover:bg-brand-charcoal">My Profile</Link>
                      <Link to="/orders" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2 text-xs text-brand-charcoal dark:text-brand-cream hover:bg-brand-blush-light dark:hover:bg-brand-charcoal">My Orders</Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2 text-xs text-brand-charcoal dark:text-brand-cream hover:bg-brand-blush-light dark:hover:bg-brand-charcoal font-semibold text-brand-blush-dark">Admin Dashboard</Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-xs text-red-500 hover:bg-brand-blush-light dark:hover:bg-brand-charcoal border-t border-brand-beige/20 mt-1"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2 text-xs text-brand-charcoal dark:text-brand-cream hover:bg-brand-blush-light dark:hover:bg-brand-charcoal">Sign In</Link>
                      <Link to="/register" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2 text-xs text-brand-charcoal dark:text-brand-cream hover:bg-brand-blush-light dark:hover:bg-brand-charcoal">Create Account</Link>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm glass h-full p-6 shadow-2xl flex flex-col justify-between z-50 animate-slide-in">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-serif text-2xl font-bold tracking-widest text-brand-charcoal dark:text-brand-cream">
                  VIORA<span className="text-brand-blush-dark">.</span>
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark p-1"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              {/* Search in Drawer */}
              <div className="mb-6">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-4 py-2 rounded-full border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                  />
                  <button type="submit" className="absolute right-3 top-2.5 text-brand-charcoal/60 dark:text-brand-cream/60">
                    <FiSearch className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-4">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold tracking-wider text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark py-2 uppercase border-b border-brand-beige-dark/10">Home</Link>
                <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold tracking-wider text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark py-2 uppercase border-b border-brand-beige-dark/10">Shop All</Link>
                <div className="py-2">
                  <span className="text-xs font-semibold tracking-wider text-brand-charcoal/50 dark:text-brand-cream/50 uppercase">Categories</span>
                  <div className="pl-4 mt-2 space-y-2 flex flex-col">
                    <Link to="/shop?category=Sarees" onClick={() => setMobileMenuOpen(false)} className="text-xs text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark py-1">Sarees</Link>
                    <Link to="/shop?category=Gowns" onClick={() => setMobileMenuOpen(false)} className="text-xs text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark py-1">Gowns</Link>
                    <Link to="/shop?category=Wedding Collection" onClick={() => setMobileMenuOpen(false)} className="text-xs text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark py-1">Wedding Collection</Link>
                    <Link to="/shop?category=Western Wear" onClick={() => setMobileMenuOpen(false)} className="text-xs text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark py-1">Western Wear</Link>
                  </div>
                </div>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold tracking-wider text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark py-2 uppercase border-b border-brand-beige-dark/10">About Us</Link>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold tracking-wider text-brand-charcoal dark:text-brand-cream hover:text-brand-blush-dark py-2 uppercase border-b border-brand-beige-dark/10">Contact</Link>
              </nav>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-brand-beige-dark/20 pt-6">
              {user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-brand-charcoal dark:text-brand-cream">{user.name}</p>
                    <button onClick={handleLogout} className="text-xs text-red-500 hover:underline mt-1">Sign Out</button>
                  </div>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-xs bg-brand-blush-dark text-white px-3 py-1.5 rounded-full font-medium">My Account</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center text-xs border border-brand-charcoal dark:border-brand-cream text-brand-charcoal dark:text-brand-cream py-2 rounded-full font-semibold">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-center text-xs bg-brand-charcoal dark:bg-brand-cream text-white dark:text-brand-charcoal py-2 rounded-full font-semibold">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
