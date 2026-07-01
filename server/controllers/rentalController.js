// controllers/rentalController.js
// WHY: Handles listing and management of Rental vehicles (Cars/Bikes).

import Rental from "../models/Rental.js";
import sendResponse from "../utils/sendResponse.js";

// @route   GET /api/rentals
// @desc    Get all available rental vehicles
// @access  Public
export const getRentals = async (req, res) => {
  try {
    const { type, search } = req.query;
    const filter = {};

    // Filter by type (Car/Bike)
    if (type && ["Car", "Bike"].includes(type)) {
      filter.type = type;
    }

    // Filter by search query
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const rentals = await Rental.find(filter).sort({ createdAt: -1 });
    return sendResponse(res, 200, "Rentals fetched successfully", { rentals });
  } catch (error) {
    console.error("Get rentals error:", error);
    return sendResponse(res, 500, "Server error fetching rental vehicles");
  }
};

// @route   GET /api/rentals/:id
// @desc    Get details of a single rental vehicle
// @access  Public
export const getRentalById = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return sendResponse(res, 404, "Rental vehicle listing not found");
    }
    return sendResponse(res, 200, "Rental vehicle fetched successfully", { rental });
  } catch (error) {
    console.error("Get rental by id error:", error);
    return sendResponse(res, 500, "Server error fetching rental details");
  }
};

// @route   POST /api/rentals
// @desc    Add a rental vehicle listing (Admin only)
// @access  Private/Admin
export const createRental = async (req, res) => {
  try {
    const { name, type, ratePerDay, transmission, fuelType, description, images } = req.body;

    if (!name || !type || !ratePerDay || !description || !images || images.length === 0) {
      return sendResponse(res, 400, "Please provide all required fields");
    }

    const rental = await Rental.create({
      name,
      type,
      ratePerDay,
      transmission: transmission || "Manual",
      fuelType: fuelType || "Petrol",
      description,
      images,
      createdBy: req.user._id,
    });

    return sendResponse(res, 201, "Rental listing created successfully", { rental });
  } catch (error) {
    console.error("Create rental error:", error);
    return sendResponse(res, 500, "Server error creating rental listing");
  }
};

// @route   PUT /api/rentals/:id
// @desc    Update a rental vehicle listing (Admin only)
// @access  Private/Admin
export const updateRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return sendResponse(res, 404, "Rental listing not found");
    }

    const { name, type, ratePerDay, transmission, fuelType, description, images, availability } = req.body;

    if (name !== undefined) rental.name = name;
    if (type !== undefined) rental.type = type;
    if (ratePerDay !== undefined) rental.ratePerDay = ratePerDay;
    if (transmission !== undefined) rental.transmission = transmission;
    if (fuelType !== undefined) rental.fuelType = fuelType;
    if (description !== undefined) rental.description = description;
    if (images !== undefined) rental.images = images;
    if (availability !== undefined) rental.availability = availability;

    const updatedRental = await rental.save();
    return sendResponse(res, 200, "Rental listing updated successfully", { rental: updatedRental });
  } catch (error) {
    console.error("Update rental error:", error);
    return sendResponse(res, 500, "Server error updating rental listing");
  }
};

// @route   DELETE /api/rentals/:id
// @desc    Delete a rental vehicle listing (Admin only)
// @access  Private/Admin
export const deleteRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return sendResponse(res, 404, "Rental listing not found");
    }

    await rental.deleteOne();
    return sendResponse(res, 200, "Rental listing deleted successfully");
  } catch (error) {
    console.error("Delete rental error:", error);
    return sendResponse(res, 500, "Server error deleting rental listing");
  }
};
