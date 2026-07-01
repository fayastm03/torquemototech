// routes/cartRoutes.js
// WHY: All cart routes are private — only logged-in users can use the cart.
// The protect middleware runs before EVERY cart controller function.
//
// Route Map:
//   GET    /api/cart            → getCart        (private)
//   POST   /api/cart            → addToCart      (private)
//   PUT    /api/cart/:itemId    → updateCartItem (private)
//   DELETE /api/cart/:itemId    → removeCartItem (private)
//   DELETE /api/cart            → clearCart      (private)
//
// IMPORTANT: DELETE /api/cart (clear all) must come BEFORE
// DELETE /api/cart/:itemId (remove one item) — otherwise Express
// might treat the clear route as a /:itemId match.

import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All cart routes require authentication — apply protect to all at once
router.use(protect);

// ─── Cart Routes ───────────────────────────────────────────────────────────
router.get("/",           getCart);       // Get current user's cart
router.post("/",          addToCart);     // Add product to cart
router.delete("/",        clearCart);     // Clear entire cart (must be before /:itemId)
router.put("/:itemId",    updateCartItem);// Update item quantity
router.delete("/:itemId", removeCartItem);// Remove single item

export default router;
