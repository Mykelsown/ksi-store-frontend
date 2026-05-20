// src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  ScrollRestoration,
} from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { AppProvider } from "./context/AppContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import Toast from "./components/Toast";

import Home from "./pages/Home";
import ShopPage from "./pages/ShopPage";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Search from "./pages/Search";
import Brands from "./pages/Brands";
import About from "./pages/About";
import Account from "./pages/Account";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Scroll to top on route change
function ScrollToTop() {
  if (typeof ScrollRestoration !== "undefined") return <ScrollRestoration />;
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="app-wrapper">
          <Navbar />

          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/phones"
                element={<ShopPage category="Smartphones" />}
              />
              <Route
                path="/laptops"
                element={<ShopPage category="Laptops" />}
              />
              <Route
                path="/accessories"
                element={<ShopPage category="Accessories" />}
              />
              <Route path="/deals" element={<ShopPage category="deals" />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/search" element={<Search />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/about" element={<About />} />
              <Route path="/account" element={<Account />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="section">
                    <div className="container empty-state">
                      <div className="empty-icon">
                        <AlertCircle size={32} />
                      </div>
                      <h3>Page Not Found</h3>
                      <p>The page you're looking for doesn't exist.</p>
                      <a
                        href="/"
                        className="btn-primary"
                        style={{
                          display: "inline-block",
                          textDecoration: "none",
                        }}
                      >
                        Go Home
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>

          <Footer />
          <ChatWidget />
          <Toast />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
