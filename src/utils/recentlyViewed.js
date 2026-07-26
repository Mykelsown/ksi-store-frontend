const STORAGE_KEY = "recentlyViewed";
const MAX_ITEMS = 10;

export const getRecentlyViewed = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addRecentlyViewed = (product) => {
  if (!product?.id) return;

  try {
    const current = getRecentlyViewed().filter((p) => p.id !== product.id);
    const entry = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      images: product.images,
      rating: product.rating,
      stock: product.stock,
    };
    const updated = [entry, ...current].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors (e.g. private browsing / quota exceeded)
  }
};
