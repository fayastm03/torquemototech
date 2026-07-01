// routes/bookingRoutes.js
// WHY: Maps service booking endpoints to controller actions.

import express from "express";
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public/Optional-auth route to submit booking
router.post("/", (req, res, next) => {
  // If authorization header exists, authenticate user; else let it pass as guest
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    return protect(req, res, next);
  }
  next();
}, createBooking);

// Private route for registered users history
router.get("/my-bookings", protect, getMyBookings);

// Admin-only actions
router.get("/", protect, admin, getAllBookings);
router.put("/:id", protect, admin, updateBookingStatus);

export default router;
