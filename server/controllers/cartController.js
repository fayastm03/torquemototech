// controllers/cartController.js
// WHY: Manages a user's shopping cart stored in MongoDB.
// Each user has exactly ONE cart document (enforced by unique index on user field).
//
// Cart operations:
//  - Get cart         → Fetch with populated product details
//  - Add item         → Create cart if none exists, or add/increase quantity
//  - Update quantity  → Change quantity of a specific cart item
//  - Remove item      → Remove a specific item by its _id
//  - Clear cart       → Empty all items (used after order is placed)

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import sendResponse from "../utils/sendResponse.js";

// ─── Helper: Get or Create Cart ────────────────────────────────────────────
// WHY: Every cart operation needs a cart document.
// Instead of repeating this logic in every function, we extract it here.
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    // First time adding to cart — create a fresh document
    cart = await Cart.create({ user: userId, items: [], totalPrice: 0, totalItems: 0 });
  }
  return cart;
};

// ─── @route   GET /api/cart ────────────────────────────────────────────────
// @desc    Get the logged-in user's cart with full product details
// @access  Private
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price images stock category" // Only fetch these fields from Product
    );

    // If user has no cart yet, return an empty cart structure
    if (!cart) {
      return sendResponse(res, 200, "Cart is empty", {
        cart: { items: [], totalPrice: 0, totalItems: 0 },
      });
    }

    return sendResponse(res, 200, "Cart fetched successfully", { cart });
  } catch (error) {
    console.error("Get cart error:", error);
    return sendResponse(res, 500, "Server error fetching cart");
  }
};

// ─── @route   POST /api/cart ───────────────────────────────────────────────
// @desc    Add a product to cart (or increase quantity if already in cart)
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // ── Validate input ──────────────────────────────────────────────────
    if (!productId) {
      return sendResponse(res, 400, "Product ID is required");
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      return sendResponse(res, 400, "Quantity must be a positive number");
    }

    // ── Verify product exists and has enough stock ───────────────────────
    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, 404, "Product not found");
    }

    if (product.stock < 1) {
      return sendResponse(res, 400, "Product is out of stock");
    }

    // ── Get or create cart ──────────────────────────────────────────────
    const cart = await getOrCreateCart(req.user._id);

    // ── Check if product already exists in cart ─────────────────────────
    // WHY: Instead of adding a duplicate item, we increase its quantity
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Product already in cart — increase quantity
      const newQty = cart.items[existingItemIndex].quantity + qty;

      // Make sure we don't exceed available stock
      if (newQty > product.stock) {
        return sendResponse(
          res,
          400,
          `Cannot add more than ${product.stock} units (only ${product.stock} in stock)`
        );
      }

      cart.items[existingItemIndex].quantity = newQty;
    } else {
      // Product not in cart — add as new item
      if (qty > product.stock) {
        return sendResponse(
          res,
          400,
          `Only ${product.stock} units available in stock`
        );
      }

      // Store a snapshot of product details at time of adding
      // WHY: If product info changes later, cart still shows correct item info
      cart.items.push({
        product: product._id,
        name: product.name,
        image: product.images[0],   // Use the first/main image
        price: product.discountedPrice > 0 ? product.discountedPrice : product.price,
        quantity: qty,
      });
    }

    // pre-save hook automatically recalculates totalPrice and totalItems
    await cart.save();

    // Re-fetch with populated product details for the response
    const updatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images stock"
    );

    return sendResponse(res, 200, "Item added to cart successfully", {
      cart: updatedCart,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return sendResponse(res, 400, "Invalid product ID format");
    }
    console.error("Add to cart error:", error);
    return sendResponse(res, 500, "Server error adding to cart");
  }
};

// ─── @route   PUT /api/cart/:itemId ───────────────────────────────────────
// @desc    Update the quantity of a specific cart item
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      return sendResponse(res, 400, "Quantity must be at least 1");
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return sendResponse(res, 404, "Cart not found");
    }

    // ── Find the item inside the cart's items array ──────────────────────
    // cart.items is a Mongoose DocumentArray, so we use .id() to find by _id
    const item = cart.items.id(itemId);
    if (!item) {
      return sendResponse(res, 404, "Item not found in cart");
    }

    // ── Check stock availability ─────────────────────────────────────────
    const product = await Product.findById(item.product);
    if (!product) {
      return sendResponse(res, 404, "Associated product no longer exists");
    }

    if (qty > product.stock) {
      return sendResponse(
        res,
        400,
        `Only ${product.stock} units available in stock`
      );
    }

    item.quantity = qty;
    await cart.save(); // pre-save hook recalculates totals

    const updatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images stock"
    );

    return sendResponse(res, 200, "Cart item updated successfully", {
      cart: updatedCart,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return sendResponse(res, 400, "Invalid item ID format");
    }
    console.error("Update cart item error:", error);
    return sendResponse(res, 500, "Server error updating cart item");
  }
};

// ─── @route   DELETE /api/cart/:itemId ────────────────────────────────────
// @desc    Remove a single item from cart
// @access  Private
export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return sendResponse(res, 404, "Cart not found");
    }

    // ── Check item exists ────────────────────────────────────────────────
    const item = cart.items.id(itemId);
    if (!item) {
      return sendResponse(res, 404, "Item not found in cart");
    }

    // ── Remove the item ──────────────────────────────────────────────────
    // Mongoose pull() removes the subdocument by its _id
    item.deleteOne();
    await cart.save(); // pre-save hook recalculates totals

    const updatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images stock"
    );

    return sendResponse(res, 200, "Item removed from cart", {
      cart: updatedCart,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return sendResponse(res, 400, "Invalid item ID format");
    }
    console.error("Remove cart item error:", error);
    return sendResponse(res, 500, "Server error removing cart item");
  }
};

// ─── @route   DELETE /api/cart ─────────────────────────────────────────────
// @desc    Clear all items from cart (used after placing an order)
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return sendResponse(res, 200, "Cart is already empty");
    }

    // Reset items array and totals
    cart.items      = [];
    cart.totalPrice = 0;
    cart.totalItems = 0;
    await cart.save();

    return sendResponse(res, 200, "Cart cleared successfully", {
      cart: { items: [], totalPrice: 0, totalItems: 0 },
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return sendResponse(res, 500, "Server error clearing cart");
  }
};
