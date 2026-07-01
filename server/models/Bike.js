// models/Bike.js
// WHY: Defines the schema for used bike listings.
// This structure handles fields relevant to pre-owned vehicles.

import mongoose from "mongoose";

const bikeSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: [true, "Bike brand is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Bike model is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Manufacturing/Registration year is required"],
      min: [1980, "Year must be valid"],
      max: [new Date().getFullYear() + 1, "Year cannot be in the future"],
    },
    kmDriven: {
      type: Number,
      required: [true, "Kilometers driven is required"],
      min: [0, "Kilometers cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    condition: {
      type: String,
      required: [true, "Bike condition is required"],
      enum: ["Excellent", "Very Good", "Good", "Fair"],
      default: "Good",
    },
    description: {
      type: String,
      required: [true, "Description/details are required"],
      trim: true,
    },
    images: [
      {
        type: String,
        required: [true, "At least one bike image is required"],
      },
    ],
    status: {
      type: String,
      enum: ["Available", "Sold"],
      default: "Available",
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

// Search indexes
bikeSchema.index({ brand: "text", model: "text" });

const Bike = mongoose.model("Bike", bikeSchema);
export default Bike;
