// models/Booking.js
// WHY: Defines the schema for garage service bookings.
// This allows users to request service appointments online and admins to track bookings.

import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow guest bookings or tie to registered user
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Contact phone number is required"],
      trim: true,
    },
    bikeModel: {
      type: String,
      required: [true, "Motorcycle model is required"],
      trim: true,
    },
    serviceType: {
      type: String,
      required: [true, "Service type is required"],
      enum: [
        "General Service",
        "Engine Repair",
        "Oil Change",
        "Custom Modifications",
        "Other Repair",
      ],
      default: "General Service",
    },
    preferredDate: {
      type: Date,
      required: [true, "Preferred service date is required"],
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ phone: 1 });
bookingSchema.index({ preferredDate: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
