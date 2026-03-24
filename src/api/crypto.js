import api from "./client";

export const createCryptoCharge = async (payload) => {
  const res = await api.post("/crypto-payments/create-charge", payload);
  return res.data;
};

export const getCryptoCharge = async (chargeId) => {
  const res = await api.get(`/crypto-payments/charge/${chargeId}`);
  return res.data;
};

export const getOrderCryptoCharges = async (orderId) => {
  const res = await api.get(`/crypto-payments/order/${orderId}/charges`);
  return res.data;
};

export const cancelCryptoCharge = async (payload) => {
  const res = await api.post("/crypto-payments/cancel", payload);
  return res.data;
};

export const sendCryptoWebhook = async (
  payload,
  signature = "test-signature",
) => {
  const res = await api.post("/crypto-payments/webhook", payload, {
    headers: {
      "x-cc-webhook-signature": signature,
    },
  });
  return res.data;
};
