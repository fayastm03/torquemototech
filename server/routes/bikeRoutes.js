// routes/bikeRoutes.js
// WHY: Maps used bike endpoints to controller actions.

import express from "express";
import {
  getBikes,
  getBikeById,
  createBike,
  updateBike,
  deleteBike,
} from "../controllers/bikeController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getBikes);
router.get("/:id", getBikeById);

// Admin-only actions
router.post("/", protect, admin, createBike);
router.put("/:id", protect, admin, updateBike);
router.delete("/:id", protect, admin, deleteBike);

export default router;
