import { useState, useEffect, useCallback } from "react";
import { AppContext } from "./appContextInstance";
import {
  getCart as getCartApi,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartApi,
} from "../api/cart";
import {
  getWishlist as getWishlistApi,
  addWishlistItem,
  removeWishlistItem,
} from "../api/wishlist";

const mapServerCartToUi = (serverCart) => {
  const items = serverCart?.items || [];
  return items.map((item) => ({
    id: item.productId,
    qty: item.quantity,
    price: Number(item.price),
    name: item.product?.name || "Product",
    brand: item.product?.brand || "KSI",
    image: Array.isArray(item.product?.images)
      ? item.product.images[0]
      : undefined,
    emoji: "Item",
  }));
};

const isWishlistEndpointMissing = (error) => {
  return (
    error?.response?.status === 404 &&
    String(error?.config?.url || "").includes("/wishlist")
  );
};

const normalizeWishlistItems = (payload) => {
  const items = payload?.data || payload || [];
  if (!Array.isArray(items)) {
    return [];
  }

  // Supports both backend response shapes:
  // 1) [{ product: {...} }]
  // 2) [{...productFields}]
  return items
    .map((item) => item?.product || item)
    .filter((item) => item && item.id);
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const sessionRaw = sessionStorage.getItem("user");
      if (sessionRaw) {
        return JSON.parse(sessionRaw);
      }

      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }
  }, [user]);

  // ── Toast ──────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "default") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    const duration = type === "error" ? 8000 : 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  // ── Theme ─────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // ── Cart ──────────────────────────────────────────────────────
  // Logged-in users get a server-synced cart. Guests get a localStorage-backed
  // cart so checkout still works without requiring an account.
  const GUEST_CART_KEY = "guestCart";

  const loadGuestCart = () => {
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveGuestCart = (items) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  };

  const [cart, setCart] = useState(() => (user?.id ? [] : loadGuestCart()));
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    let isCancelled = false;

    const loadCart = async () => {
      const token = sessionStorage.getItem("token");
      if (!token || !user?.id) {
        if (!isCancelled) {
          setCart(loadGuestCart());
        }
        return;
      }

      try {
        const response = await getCartApi();
        const cartData = response?.data || response;

        if (!isCancelled) {
          setCart(mapServerCartToUi(cartData));
        }
      } catch {
        if (!isCancelled) {
          setCart([]);
        }
      }
    };

    void loadCart();

    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    let isCancelled = false;

    const loadWishlist = async () => {
      const token = sessionStorage.getItem("token");
      if (!token || !user?.id) {
        if (!isCancelled) {
          setWishlist([]);
        }
        return;
      }

      try {
        const response = await getWishlistApi();
        const wishlistItems = normalizeWishlistItems(response);

        if (!isCancelled) {
          setWishlist(wishlistItems);
        }
      } catch (error) {
        if (!isCancelled) {
          // Hosted backend may not include wishlist routes yet.
          // Keep UI functional without surfacing a hard failure.
          if (isWishlistEndpointMissing(error)) {
            setWishlist([]);
            return;
          }

          setWishlist([]);
        }
      }
    };

    void loadWishlist();

    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

  const addToCart = useCallback(
    async (product) => {
      const token = sessionStorage.getItem("token");
      if (!token || !user?.id) {
        setCart((prev) => {
          const existing = prev.find((c) => c.id === product.id);
          const next = existing
            ? prev.map((c) =>
                c.id === product.id ? { ...c, qty: c.qty + 1 } : c,
              )
            : [
                ...prev,
                {
                  id: product.id,
                  qty: 1,
                  price: Number(product.price),
                  name: product.name,
                  brand: product.brand || "KSI",
                  image: Array.isArray(product.images)
                    ? product.images[0]
                    : undefined,
                },
              ];
          saveGuestCart(next);
          return next;
        });
        showToast(`${product.name} added to cart`);
        return;
      }

      try {
        const response = await addCartItem({
          productId: product.id,
          quantity: 1,
        });
        const cartData = response?.data || response;
        setCart(mapServerCartToUi(cartData));
        showToast(`${product.name} added to cart`);
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to add item to cart";
        showToast(message);
      }
    },
    [showToast, user?.id],
  );

  const removeFromCart = useCallback(
    async (id) => {
      if (!user?.id) {
        setCart((prev) => {
          const next = prev.filter((c) => c.id !== id);
          saveGuestCart(next);
          return next;
        });
        return;
      }

      try {
        const response = await removeCartItem(id);
        const cartData = response?.data || response;
        setCart(mapServerCartToUi(cartData));
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to remove item";
        showToast(message);
      }
    },
    [showToast, user?.id],
  );

  const updateQty = useCallback(
    async (id, delta) => {
      const current = cart.find((c) => c.id === id);
      if (!current) {
        return;
      }

      const nextQty = Math.max(1, current.qty + delta);

      if (!user?.id) {
        setCart((prev) => {
          const next = prev.map((c) =>
            c.id === id ? { ...c, qty: nextQty } : c,
          );
          saveGuestCart(next);
          return next;
        });
        return;
      }

      try {
        const response = await updateCartItem(id, { quantity: nextQty });
        const cartData = response?.data || response;
        setCart(mapServerCartToUi(cartData));
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to update quantity";
        showToast(message);
      }
    },
    [cart, showToast, user?.id],
  );

  const clearCart = useCallback(async () => {
    if (!user?.id) {
      setCart([]);
      saveGuestCart([]);
      return;
    }

    try {
      const response = await clearCartApi();
      const cartData = response?.data || response;
      setCart(mapServerCartToUi(cartData));
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to clear cart";
      showToast(message);
    }
  }, [showToast, user?.id]);

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  // ── Wishlist ───────────────────────────────────────────────────
  const toggleWishlist = useCallback(
    async (product) => {
      const token = sessionStorage.getItem("token");
      if (!token || !user?.id) {
        showToast("Please sign in to use wishlist");
        return;
      }

      const exists = wishlist.some((w) => w.id === product.id);

      try {
        const response = exists
          ? await removeWishlistItem(product.id)
          : await addWishlistItem({ productId: product.id });

        const wishlistItems = normalizeWishlistItems(response);
        setWishlist(wishlistItems);
        showToast(
          exists
            ? "Removed from wishlist"
            : `${product.name} added to wishlist`,
        );
      } catch (error) {
        if (isWishlistEndpointMissing(error)) {
          // Fallback mode for older backend deployments without wishlist routes.
          setWishlist((prev) => {
            const isAlreadyInWishlist = prev.some((w) => w.id === product.id);
            if (isAlreadyInWishlist) {
              return prev.filter((w) => w.id !== product.id);
            }

            return [...prev, product];
          });

          showToast(
            exists
              ? "Removed from wishlist (local mode)"
              : `${product.name} added to wishlist (local mode)`,
          );
          return;
        }

        const message =
          error?.response?.data?.message || "Wishlist action failed";
        showToast(message);
      }
    },
    [showToast, user?.id, wishlist],
  );

  const isWishlisted = useCallback(
    (id) => wishlist.some((w) => w.id === id),
    [wishlist],
  );

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartCount,
        cartTotal,
        wishlist,
        toggleWishlist,
        isWishlisted,
        user,
        setUser,
        toasts,
        setToasts,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
