// services/bookingService.js
// WHY: Houses all API requests for garage appointments.

import api from "./api";

export const createBooking = async (bookingData) => {
  const { data } = await api.post("/bookings", bookingData);
  return data.data.booking;
};

export const getMyBookings = async () => {
  const { data } = await api.get("/bookings/my-bookings");
  return data.data.bookings;
};

// Admin actions
export const getAllBookings = async () => {
  const { data } = await api.get("/bookings");
  return data.data.bookings;
};

export const updateBookingStatus = async (id, status) => {
  const { data } = await api.put(`/bookings/${id}`, { status });
  return data.data.booking;
};
