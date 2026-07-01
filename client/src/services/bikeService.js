// services/bikeService.js
// WHY: Houses all API requests for Used Bikes.

import api from "./api";

export const getBikes = async (params = {}) => {
  const { data } = await api.get("/bikes", { params });
  return data.data.bikes;
};

export const getBikeById = async (id) => {
  const { data } = await api.get(`/bikes/${id}`);
  return data.data.bike;
};

// Admin actions
export const createBikeListing = async (bikeData) => {
  const { data } = await api.post("/bikes", bikeData);
  return data.data.bike;
};

export const updateBikeListing = async (id, bikeData) => {
  const { data } = await api.put(`/bikes/${id}`, bikeData);
  return data.data.bike;
};

export const deleteBikeListing = async (id) => {
  const { data } = await api.delete(`/bikes/${id}`);
  return data;
};
