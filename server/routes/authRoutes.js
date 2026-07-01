// routes/authRoutes.js
// WHY: Maps HTTP methods + URL paths → Controller functions.
// Routes are intentionally kept thin — no logic here, just routing.
//
// Route Map:
//   POST   /api/auth/register    → registerUser  (public)
//   POST   /api/auth/login       → loginUser     (public)
//   POST   /api/auth/logout      → logoutUser    (private)
//   GET    /api/auth/me          → getMe         (private)
//   PUT    /api/auth/me          → updateProfile (private)
//   PUT    /api/auth/password    → changePassword(private)

import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  logoutUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Public Routes ─────────────────────────────────────────────────────────
// No middleware — anyone can access these
router.post("/register", registerUser);
router.post("/login", loginUser);

// ─── Private Routes ────────────────────────────────────────────────────────
// "protect" middleware runs FIRST → verifies JWT → then controller runs
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);
router.put("/password", protect, changePassword);

export default router;
