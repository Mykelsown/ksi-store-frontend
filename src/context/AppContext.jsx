// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Theme ─────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem('ksi_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ksi_theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(t => (t === 'light' ? 'dark' : 'light'));

  // ── Cart ──────────────────────────────────────────────────────
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ksi_cart') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('ksi_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id);
      if (existing) {
        return prev.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.name} added to cart 🛒`);
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateQty = useCallback((id, delta) => {
    setCart(prev =>
      prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  // ── Wishlist ───────────────────────────────────────────────────
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ksi_wishlist') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('ksi_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.find(w => w.id === product.id);
      if (exists) {
        showToast('Removed from wishlist');
        return prev.filter(w => w.id !== product.id);
      }
      showToast(`${product.name} added to wishlist ❤️`);
      return [...prev, product];
    });
  }, []);

  const isWishlisted = useCallback((id) => wishlist.some(w => w.id === id), [wishlist]);

  // ── Toast ──────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // ── Search ────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal,
      wishlist, toggleWishlist, isWishlisted,
      toasts, showToast,
      searchQuery, setSearchQuery,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
