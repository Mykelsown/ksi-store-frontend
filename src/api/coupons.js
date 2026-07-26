import api from "./client";

export const validateCoupon = async (code, subtotal) => {
  const res = await api.post("/coupons/validate", { code, subtotal });
  return res.data;
};

export const getCoupons = async () => {
  const res = await api.get("/coupons");
  return res.data;
};

export const createCoupon = async (payload) => {
  const res = await api.post("/coupons", payload);
  return res.data;
};

export const updateCoupon = async (id, payload) => {
  const res = await api.put(`/coupons/${id}`, payload);
  return res.data;
};

export const deleteCoupon = async (id) => {
  const res = await api.delete(`/coupons/${id}`);
  return res.data;
};
