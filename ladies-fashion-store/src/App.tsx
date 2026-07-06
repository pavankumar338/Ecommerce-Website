import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { ShopProvider } from './context/ShopContext';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Wishlist } from './pages/Wishlist';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { MyOrders } from './pages/MyOrders';
import { ContactUs } from './pages/ContactUs';
import { AboutUs } from './pages/AboutUs';
import { FAQ } from './pages/FAQ';
import { AdminDashboard } from './pages/AdminDashboard';

// Elegant Scroll To Top Helper on Route Changes
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// 404 Page Component
const NotFound: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-24 text-center px-4">
      <h1 className="font-serif text-6xl font-bold text-brand-blush-dark">404</h1>
      <h2 className="font-serif text-2xl font-bold mt-4 text-brand-charcoal dark:text-white">Page Not Found</h2>
      <p className="text-xs text-brand-charcoal/60 dark:text-brand-cream/60 mt-2 font-light">
        The luxury collection page you are looking for has been moved or archived.
      </p>
      <a
        href="/"
        className="mt-8 inline-block bg-brand-charcoal text-white text-xs font-bold py-3.5 px-8 rounded-lg uppercase tracking-widest hover:bg-brand-blush-dark transition"
      >
        Return Home
      </a>
    </div>
  );
};

function App() {
  return (
    <ShopProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col justify-between bg-brand-cream-light dark:bg-black/90 transition-colors duration-300">
          
          {/* Glassmorphic Sticky Header */}
          <Navbar />

          {/* Main App Page Body */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Luxury Footer */}
          <Footer />

        </div>
        
        {/* Alerts and Toast Configurations */}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </ShopProvider>
  );
}

export default App;