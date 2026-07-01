// routes/orderRoutes.js
// WHY: Maps all order-related endpoints to their controllers.
//
// Route Map:
//   POST   /api/orders                → placeOrder       (private)
//   GET    /api/orders/my-orders      → getMyOrders      (private)
//   GET    /api/orders/:id            → getOrderById     (private — owner or admin)
//   GET    /api/orders                → getAllOrders      (admin)
//   PUT    /api/orders/:id/status     → updateOrderStatus(admin)
//   PUT    /api/orders/:id/pay        → markOrderAsPaid  (admin)
//
// IMPORTANT: /my-orders MUST come before /:id
// Otherwise Express treats "my-orders" as an :id value

import express from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  markOrderAsPaid,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Private Routes ─────────────────────────────────────────────────────────
router.post("/",            protect,        placeOrder);    // Place order
router.get("/my-orders",    protect,        getMyOrders);   // My history (before /:id!)
router.get("/:id",          protect,        getOrderById);  // Single order

// ─── Admin Routes ────────────────────────────────────────────────────────────
router.get("/",             protect, admin, getAllOrders);         // All orders
router.put("/:id/status",   protect, admin, updateOrderStatus);   // Update status
router.put("/:id/pay",      protect, admin, markOrderAsPaid);     // Mark paid

export default router;
