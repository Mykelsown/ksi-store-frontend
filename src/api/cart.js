import api from "./client";

export const getCart = async () => {
  const res = await api.get("/cart");
  return res.data;
};

export const addCartItem = async (payload) => {
  const res = await api.post("/cart/items", payload);
  return res.data;
};

export const updateCartItem = async (productId, payload) => {
  const res = await api.put(`/cart/items/${productId}`, payload);
  return res.data;
};

export const removeCartItem = async (productId) => {
  const res = await api.delete(`/cart/items/${productId}`);
  return res.data;
};

export const clearCart = async () => {
  const res = await api.delete("/cart");
  return res.data;
};
