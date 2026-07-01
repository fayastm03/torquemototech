// routes/adminRoutes.js
// WHY: All admin routes require BOTH protect (logged in) AND admin (role check).
// This is the most secure set of routes in the application.
//
// Route Map:
//   GET    /api/admin/dashboard       → getDashboardStats  (admin)
//   GET    /api/admin/users           → getAllUsers         (admin)
//   GET    /api/admin/users/:id       → getUserById        (admin)
//   PUT    /api/admin/users/:id       → updateUser         (admin)
//   DELETE /api/admin/users/:id       → deleteUser         (admin)

import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply BOTH middleware to every route in this file at once
// WHY: router.use() applies middleware globally to all routes below it.
// Much cleaner than repeating protect, admin on every single route.
router.use(protect, admin);

// ─── Dashboard ──────────────────────────────────────────────────────────────
router.get("/dashboard", getDashboardStats);

// ─── User Management ────────────────────────────────────────────────────────
router.get("/users",        getAllUsers);    // List all users
router.get("/users/:id",    getUserById);   // Single user + their orders
router.put("/users/:id",    updateUser);    // Update name / email / role
router.delete("/users/:id", deleteUser);    // Delete user

export default router;
