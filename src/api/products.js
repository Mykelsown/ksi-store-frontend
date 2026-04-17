import api from "./client";

export const getProducts = async (params = {}) => {
  const normalizedParams = { ...params };

  if (normalizedParams.limit !== undefined) {
    const parsedLimit = Number(normalizedParams.limit);

    if (Number.isFinite(parsedLimit)) {
      normalizedParams.limit = Math.min(
        100,
        Math.max(1, Math.trunc(parsedLimit)),
      );
    } else {
      delete normalizedParams.limit;
    }
  }

  const res = await api.get("/products", { params: normalizedParams });
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
