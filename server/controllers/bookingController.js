// controllers/bookingController.js
// WHY: Handles garage service bookings and management.

import Booking from "../models/Booking.js";
import sendResponse from "../utils/sendResponse.js";

// @route   POST /api/bookings
// @desc    Create a new garage service booking
// @access  Public (Optional auth)
export const createBooking = async (req, res) => {
  try {
    const { customerName, phone, bikeModel, serviceType, preferredDate, notes } = req.body;

    if (!customerName || !phone || !bikeModel || !serviceType || !preferredDate) {
      return sendResponse(res, 400, "Please provide all required booking details");
    }

    const bookingData = {
      customerName,
      phone,
      bikeModel,
      serviceType,
      preferredDate: new Date(preferredDate),
      notes,
    };

    // If request has verified auth token, attach to booking
    if (req.user) {
      bookingData.user = req.user._id;
    }

    const booking = await Booking.create(bookingData);
    return sendResponse(res, 201, "Service booking requested successfully", { booking });
  } catch (error) {
    console.error("Create booking error:", error);
    return sendResponse(res, 500, "Server error creating service booking");
  }
};

// @route   GET /api/bookings/my-bookings
// @desc    Get user's personal booking history
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ preferredDate: -1 });
    return sendResponse(res, 200, "My service bookings fetched successfully", { bookings });
  } catch (error) {
    console.error("Get my bookings error:", error);
    return sendResponse(res, 500, "Server error fetching user bookings");
  }
};

// @route   GET /api/bookings
// @desc    Get all bookings (Admin only)
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ preferredDate: -1 });
    return sendResponse(res, 200, "All service bookings fetched", { bookings });
  } catch (error) {
    console.error("Get all bookings error:", error);
    return sendResponse(res, 500, "Server error fetching all bookings");
  }
};

// @route   PUT /api/bookings/:id
// @desc    Update booking status (Admin only)
// @access  Private/Admin
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];

    if (!status || !validStatuses.includes(status)) {
      return sendResponse(res, 400, `Invalid status. Must be: ${validStatuses.join(", ")}`);
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return sendResponse(res, 404, "Service booking not found");
    }

    booking.status = status;
    const updatedBooking = await booking.save();

    return sendResponse(res, 200, "Booking status updated successfully", { booking: updatedBooking });
  } catch (error) {
    console.error("Update booking error:", error);
    return sendResponse(res, 500, "Server error updating booking");
  }
};
