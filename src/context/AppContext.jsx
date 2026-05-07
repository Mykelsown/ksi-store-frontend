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
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // ── Cart ──────────────────────────────────────────────────────
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    let isCancelled = false;

    const loadCart = async () => {
      const token = sessionStorage.getItem("token");
      if (!token || !user?.id) {
        if (!isCancelled) {
          setCart([]);
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
        showToast("Please sign in to add items to cart");
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
    [showToast],
  );

  const updateQty = useCallback(
    async (id, delta) => {
      const current = cart.find((c) => c.id === id);
      if (!current) {
        return;
      }

      const nextQty = Math.max(1, current.qty + delta);

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
    [cart, showToast],
  );

  const clearCart = useCallback(async () => {
    try {
      const response = await clearCartApi();
      const cartData = response?.data || response;
      setCart(mapServerCartToUi(cartData));
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to clear cart";
      showToast(message);
    }
  }, [showToast]);

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

  // ── Search ────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");

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
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
