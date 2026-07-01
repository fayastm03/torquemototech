// services/rentalService.js
// WHY: Houses all API requests for Rental vehicles (Cars/Bikes).

import api from "./api";

export const getRentals = async (params = {}) => {
  const { data } = await api.get("/rentals", { params });
  return data.data.rentals;
};

export const getRentalById = async (id) => {
  const { data } = await api.get(`/rentals/${id}`);
  return data.data.rental;
};

// Admin actions
export const createRentalListing = async (rentalData) => {
  const { data } = await api.post("/rentals", rentalData);
  return data.data.rental;
};

export const updateRentalListing = async (id, rentalData) => {
  const { data } = await api.put(`/rentals/${id}`, rentalData);
  return data.data.rental;
};

export const deleteRentalListing = async (id) => {
  const { data } = await api.delete(`/rentals/${id}`);
  return data;
};
