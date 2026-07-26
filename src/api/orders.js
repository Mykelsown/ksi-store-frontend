import api from "./client";

export const createOrder = async (payload) => {
  const res = await api.post("/orders", payload);
  return res.data;
};

export const getMyOrders = async (params = {}) => {
  const res = await api.get("/orders/my-orders", { params });
  return res.data;
};

export const getMyOrderStats = async () => {
  const res = await api.get("/orders/my-stats");
  return res.data;
};

export const getOrderById = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

export const cancelOrder = async (id, reason) => {
  const res = await api.post(`/orders/${id}/cancel`, { reason });
  return res.data;
};

export const getAllOrders = async (params = {}) => {
  const res = await api.get("/orders", { params });
  return res.data;
};

export const getOrderStats = async () => {
  const res = await api.get("/orders/stats");
  return res.data;
};

export const updateOrderStatus = async (id, payload) => {
  const res = await api.put(`/orders/${id}/status`, payload);
  return res.data;
};

export const updateOrderPaymentStatus = async (id, payload) => {
  const res = await api.put(`/orders/${id}/payment-status`, payload);
  return res.data;
};

export const trackGuestOrder = async (orderNumber, email) => {
  const res = await api.get("/orders/track", {
    params: { orderNumber, email },
  });
  return res.data;
};

export const getInvoiceUrl = (id) => {
  const base = api.defaults.baseURL || "";
  return `${base}/orders/${id}/invoice`;
};

export const downloadInvoice = async (id) => {
  const res = await api.get(`/orders/${id}/invoice`, {
    responseType: "blob",
  });
  return res.data;
};

export const getSalesAnalytics = async (days = 30) => {
  const res = await api.get("/orders/analytics", { params: { days } });
  return res.data;
};
