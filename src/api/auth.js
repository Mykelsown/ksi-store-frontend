// src/api/auth.js
import api from "./client";

export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const refreshToken = async (refreshTokenValue) => {
  const res = await api.post("/auth/refresh", { refreshToken: refreshTokenValue });
  return res.data;
};

export const requestPasswordReset = async (email) => {
  const res = await api.post("/auth/request-password-reset", { email });
  return res.data;
};

export const verifyResetToken = async (token) => {
  const res = await api.post("/auth/verify-reset-token", { token });
  return res.data;
};

export const resetPassword = async (token, newPassword) => {
  const res = await api.post("/auth/reset-password", { token, newPassword });
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const changePassword = async (oldPassword, newPassword) => {
  const res = await api.post("/auth/change-password", {
    oldPassword,
    newPassword,
  });
  return res.data;
};