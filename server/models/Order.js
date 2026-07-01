// models/Order.js
// WHY: An order is a permanent snapshot of a purchase.
// Once placed, the products list NEVER changes (even if products are edited/deleted).
//
// Key decisions:
//  - We copy product name, price, image INTO the order (snapshot pattern)
//    This ensures order history stays accurate even if the product is later edited
//  - status tracks the lifecycle: pending → processing → shipped → delivered
//  - shippingAddress is embedded (not referenced) because it can differ per order
//  - isPaid and isDelivered are quick boolean flags for filtering

import mongoose from "mongoose";

// ─── Order Item Subdocument ────────────────────────────────────────────────
// A snapshot of each product at the time of purchase
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  // Snapshot fields — stored directly so order history never breaks
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },    // Price at time of purchase
  quantity: { type: Number, required: true, min: 1 },
});

// ─── Shipping Address Subdocument ─────────────────────────────────────────
// Embedded because the address can be different for each order
const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: [true, "Full name is required"] },
  phone: { type: String, required: [true, "Phone number is required"] },
  addressLine1: { type: String, required: [true, "Address is required"] },
  addressLine2: { type: String, default: "" },
  city: { type: String, required: [true, "City is required"] },
  state: { type: String, required: [true, "State is required"] },
  postalCode: { type: String, required: [true, "Postal code is required"] },
  country: { type: String, required: [true, "Country is required"], default: "India" },
});

// ─── Main Order Schema ─────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // Which user placed this order
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The items purchased (array of snapshots)
    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order must have at least one item",
      },
    },

    // Where to deliver
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    // Payment method chosen by the user
    paymentMethod: {
      type: String,
      required: true,
      enum: ["COD", "Card", "UPI", "NetBanking"],
      default: "COD",
    },

    // ─── Price Breakdown ────────────────────────────────────────────
    itemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,            // Free shipping if order > ₹500
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0,            // 18% GST applied at checkout
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,            // itemsPrice + shippingPrice + taxPrice
    },

    // ─── Order Status Lifecycle ─────────────────────────────────────
    // Status moves forward: pending → processing → shipped → delivered
    // (or) → cancelled at any point by admin
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // Payment tracking
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },

    // Delivery tracking
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },

    // Optional: tracking ID from courier
    trackingId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index for Performance ─────────────────────────────────────────────────
// Users frequently look up their own orders — index makes this fast
orderSchema.index({ user: 1, createdAt: -1 });
// Admin frequently filters by status
orderSchema.index({ status: 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
