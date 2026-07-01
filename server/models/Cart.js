// models/Cart.js
// WHY: Each user has exactly ONE cart document in the database.
// The cart holds an array of items (product reference + quantity).
//
// Key decisions:
//  - One cart per user (enforced by unique: true on userId)
//  - We store price at the time of adding (not live price) to prevent
//    price changes from silently affecting the cart total
//  - totalPrice is stored for quick reads (recalculated on every update)

import mongoose from "mongoose";

// ─── Cart Item Subdocument ─────────────────────────────────────────────────
// Represents a single item inside the cart
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",   // Reference so we can .populate() full product info
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },

    // Store the price at the time of adding to cart
    // WHY: If product price changes later, cart total remains stable
    price: {
      type: Number,
      required: true,
    },

    // Snapshot of product name (for display even if product is deleted)
    name: {
      type: String,
      required: true,
    },

    // Snapshot of product image
    image: {
      type: String,
      required: true,
    },
  },
  { _id: true }  // Each cart item gets its own _id (useful for removal)
);

// ─── Cart Schema ───────────────────────────────────────────────────────────
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,   // IMPORTANT: Only one cart document per user
    },

    items: [cartItemSchema],  // Array of cart items (using sub-schema above)

    // Pre-calculated total — updated every time items change
    // WHY: Storing it avoids recalculating on every page load
    totalPrice: {
      type: Number,
      default: 0,
    },

    // Total number of items (sum of quantities)
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Pre-Save Hook: Recalculate Totals ────────────────────────────────────
// WHY: Every time the cart is saved (item added/removed/updated),
// automatically recalculate totalPrice and totalItems.
// This keeps the data consistent without manual calculation in controllers.
cartSchema.pre("save", function (next) {
  this.totalPrice = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  this.totalItems = this.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  next();
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
