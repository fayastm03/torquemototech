// routes/productRoutes.js
// WHY: Maps all product-related URL endpoints to their controller functions.
//
// Route Map:
//   GET    /api/products                  → getProducts       (public)
//   GET    /api/products/featured         → getFeaturedProducts (public)
//   GET    /api/products/categories       → getCategories     (public)
//   GET    /api/products/:id              → getProductById    (public)
//   POST   /api/products                  → createProduct     (admin)
//   PUT    /api/products/:id              → updateProduct     (admin)
//   DELETE /api/products/:id              → deleteProduct     (admin)
//   POST   /api/products/:id/reviews      → addProductReview  (private)
//
// IMPORTANT: Static routes (/featured, /categories) MUST be declared
// BEFORE dynamic routes (/:id) — otherwise Express treats "featured"
// as an :id parameter and tries to find a product with id="featured"

import express from "express";
import {
  getProducts,
  getFeaturedProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Public Routes ─────────────────────────────────────────────────────────
router.get("/",           getProducts);          // List all (search/filter/sort)
router.get("/featured",   getFeaturedProducts);  // Home page featured section
router.get("/categories", getCategories);        // Unique category list

// ─── Dynamic Route — Single Product ────────────────────────────────────────
router.get("/:id", getProductById);

// ─── Private Route — Add Review ────────────────────────────────────────────
router.post("/:id/reviews", protect, addProductReview);

// ─── Admin-Only Routes ──────────────────────────────────────────────────────
// protect → verifies JWT first, admin → checks role second
router.post("/",      protect, admin, createProduct);
router.put("/:id",    protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

export default router;
