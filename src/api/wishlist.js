import api from "./client";

export const getWishlist = async () => {
  const res = await api.get("/wishlist");
  return res.data;
};

export const addWishlistItem = async (payload) => {
  const res = await api.post("/wishlist/items", payload);
  return res.data;
};

export const removeWishlistItem = async (productId) => {
  const res = await api.delete(`/wishlist/items/${productId}`);
  return res.data;
};

export const clearWishlist = async () => {
  const res = await api.delete("/wishlist");
  return res.data;
};
