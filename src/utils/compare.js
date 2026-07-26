const STORAGE_KEY = "compareList";
const MAX_ITEMS = 3;

export const getCompareList = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const save = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
  window.dispatchEvent(new Event("compare-list-changed"));
};

export const isInCompareList = (productId) =>
  getCompareList().some((p) => p.id === productId);

export const addToCompare = (product) => {
  if (!product?.id) return { success: false, reason: "invalid" };

  const current = getCompareList();
  if (current.some((p) => p.id === product.id)) {
    return { success: false, reason: "duplicate" };
  }
  if (current.length >= MAX_ITEMS) {
    return { success: false, reason: "limit" };
  }

  const entry = {
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    images: product.images,
    rating: product.rating,
    category: product.category,
    specs: product.specs,
  };

  save([...current, entry]);
  return { success: true };
};

export const removeFromCompare = (productId) => {
  save(getCompareList().filter((p) => p.id !== productId));
};

export const clearCompareList = () => {
  save([]);
};
