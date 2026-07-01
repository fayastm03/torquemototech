// models/Rental.js
// WHY: Defines the schema for rental vehicle listings (cars and bikes).

import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vehicle name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Vehicle type is required"],
      enum: ["Car", "Bike"],
      default: "Bike",
    },
    ratePerDay: {
      type: Number,
      required: [true, "Rental rate per day is required"],
      min: [0, "Rate cannot be negative"],
    },
    transmission: {
      type: String,
      required: [true, "Transmission type is required"],
      enum: ["Manual", "Automatic"],
      default: "Manual",
    },
    fuelType: {
      type: String,
      required: [true, "Fuel type is required"],
      enum: ["Petrol", "Diesel", "EV"],
      default: "Petrol",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    images: [
      {
        type: String,
        required: [true, "At least one image is required"],
      },
    ],
    availability: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add search indexes
rentalSchema.index({ name: "text" });

const Rental = mongoose.model("Rental", rentalSchema);
export default Rental;
