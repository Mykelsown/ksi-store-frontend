import api from "./client";

export const submitContactMessage = async (payload) => {
  const res = await api.post("/support/contact", payload);
  return res.data;
};

export const chatWithSupport = async (payload) => {
  const res = await api.post("/support/chat", payload);
  return res.data;
};
