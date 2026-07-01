// controllers/bikeController.js
// WHY: Handles listing and management of Used Bikes.

import Bike from "../models/Bike.js";
import sendResponse from "../utils/sendResponse.js";

// @route   GET /api/bikes
// @desc    Get all available pre-owned bikes
// @access  Public
export const getBikes = async (req, res) => {
  try {
    const { brand, condition, search } = req.query;
    const filter = { status: "Available" };

    if (brand) {
      filter.brand = { $regex: brand, $options: "i" };
    }
    if (condition) {
      filter.condition = condition;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const bikes = await Bike.find(filter).sort({ createdAt: -1 });
    return sendResponse(res, 200, "Bikes fetched successfully", { bikes });
  } catch (error) {
    console.error("Get bikes error:", error);
    return sendResponse(res, 500, "Server error fetching used bikes");
  }
};

// @route   GET /api/bikes/:id
// @desc    Get bike details
// @access  Public
export const getBikeById = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return sendResponse(res, 404, "Bike listing not found");
    }
    return sendResponse(res, 200, "Bike fetched successfully", { bike });
  } catch (error) {
    console.error("Get bike by id error:", error);
    return sendResponse(res, 500, "Server error fetching bike details");
  }
};

// @route   POST /api/bikes
// @desc    Add a pre-owned bike listing (Admin only)
// @access  Private/Admin
export const createBike = async (req, res) => {
  try {
    const { brand, model, year, kmDriven, price, condition, description, images } = req.body;

    if (!brand || !model || !year || !kmDriven || !price || !description || !images || images.length === 0) {
      return sendResponse(res, 400, "Please provide all required fields");
    }

    const bike = await Bike.create({
      brand,
      model,
      year,
      kmDriven,
      price,
      condition,
      description,
      images,
      createdBy: req.user._id,
    });

    return sendResponse(res, 201, "Used bike listing created successfully", { bike });
  } catch (error) {
    console.error("Create bike error:", error);
    return sendResponse(res, 500, "Server error creating used bike listing");
  }
};

// @route   PUT /api/bikes/:id
// @desc    Update bike listing (Admin only)
// @access  Private/Admin
export const updateBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return sendResponse(res, 404, "Bike listing not found");
    }

    const { brand, model, year, kmDriven, price, condition, description, images, status } = req.body;

    if (brand !== undefined) bike.brand = brand;
    if (model !== undefined) bike.model = model;
    if (year !== undefined) bike.year = year;
    if (kmDriven !== undefined) bike.kmDriven = kmDriven;
    if (price !== undefined) bike.price = price;
    if (condition !== undefined) bike.condition = condition;
    if (description !== undefined) bike.description = description;
    if (images !== undefined) bike.images = images;
    if (status !== undefined) bike.status = status;

    const updatedBike = await bike.save();
    return sendResponse(res, 200, "Bike listing updated successfully", { bike: updatedBike });
  } catch (error) {
    console.error("Update bike error:", error);
    return sendResponse(res, 500, "Server error updating bike listing");
  }
};

// @route   DELETE /api/bikes/:id
// @desc    Delete bike listing (Admin only)
// @access  Private/Admin
export const deleteBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return sendResponse(res, 404, "Bike listing not found");
    }

    await bike.deleteOne();
    return sendResponse(res, 200, "Bike listing deleted successfully");
  } catch (error) {
    console.error("Delete bike error:", error);
    return sendResponse(res, 500, "Server error deleting bike listing");
  }
};
