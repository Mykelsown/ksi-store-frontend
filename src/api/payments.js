import api from "./client";

export const getPaymentConfig = async () => {
  const res = await api.get("/payments/config");
  return res.data;
};

export const createPaymentIntent = async (payload) => {
  const res = await api.post("/payments/create-intent", payload);
  return res.data;
};

export const confirmPayment = async (payload) => {
  const res = await api.post("/payments/confirm", payload);
  return res.data;
};

export const getPaymentStatus = async (paymentIntentId) => {
  const res = await api.get(`/payments/status/${paymentIntentId}`);
  return res.data;
};

export const cancelPayment = async (payload) => {
  const res = await api.post("/payments/cancel", payload);
  return res.data;
};

export const refundPayment = async (payload) => {
  const res = await api.post("/payments/refund", payload);
  return res.data;
};

export const sendPaymentWebhook = async (payload, signature = "test-signature") => {
  const res = await api.post("/payments/webhook", payload, {
    headers: {
      "stripe-signature": signature,
    },
  });
  return res.data;
};
