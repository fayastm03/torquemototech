// routes/rentalRoutes.js
// WHY: Maps rental endpoints to controller actions.

import express from "express";
import {
  getRentals,
  getRentalById,
  createRental,
  updateRental,
  deleteRental,
} from "../controllers/rentalController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getRentals);
router.get("/:id", getRentalById);

// Admin-only actions
router.post("/", protect, admin, createRental);
router.put("/:id", protect, admin, updateRental);
router.delete("/:id", protect, admin, deleteRental);

export default router;
