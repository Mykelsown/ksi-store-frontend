import api from "./client";

export const getProfile = async () => {
  const res = await api.get("/users/profile");
  return res.data;
};

export const updateProfile = async (payload) => {
  const res = await api.put("/users/profile", payload);
  return res.data;
};

export const deleteMyAccount = async () => {
  const res = await api.delete("/users/account");
  return res.data;
};

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const getUserById = async (userId) => {
  const res = await api.get(`/users/${userId}`);
  return res.data;
};

export const deactivateUser = async (userId) => {
  const res = await api.put(`/users/${userId}/deactivate`);
  return res.data;
};

export const reactivateUser = async (userId) => {
  const res = await api.put(`/users/${userId}/reactivate`);
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await api.delete(`/users/${userId}`);
  return res.data;
};
