import api from "./client";

export const getProducts = async (params = {}) => {
  const res = await api.get("/products", { params });
  return res.data;
};

export const getProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

export const getProductReviews = async (id) => {
  const res = await api.get(`/products/${id}/reviews`);
  return res.data;
};

export const addProductReview = async (id, payload) => {
  const res = await api.post(`/products/${id}/reviews`, payload);
  return res.data;
};

export const updateProductReview = async (reviewId, payload) => {
  const res = await api.put(`/products/reviews/${reviewId}`, payload);
  return res.data;
};

export const deleteProductReview = async (reviewId) => {
  const res = await api.delete(`/products/reviews/${reviewId}`);
  return res.data;
};

export const createProduct = async (payload) => {
  const res = await api.post("/products", payload);
  return res.data;
};

export const updateProduct = async (id, payload) => {
  const res = await api.put(`/products/${id}`, payload);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};
