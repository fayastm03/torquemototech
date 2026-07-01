// controllers/orderController.js
// WHY: Handles the full order lifecycle — from placing to tracking to admin management.
//
// Business rules enforced:
//  1. On place order: validate cart → calculate prices → save order → clear cart → update stock
//  2. Users can only see their OWN orders (not other users' orders)
//  3. Admin can see ALL orders and update status
//  4. Order items are a permanent snapshot — edits to products don't affect past orders
//
// Price formula:
//   itemsPrice    = sum of (item.price × item.quantity)
//   shippingPrice = 0 if itemsPrice >= 500, else 60
//   taxPrice      = itemsPrice × 0.18  (18% GST)
//   totalPrice    = itemsPrice + shippingPrice + taxPrice

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import sendResponse from "../utils/sendResponse.js";

// ─── Helper: Calculate Prices ──────────────────────────────────────────────
// WHY: Centralised so the same formula is used everywhere
const calculatePrices = (orderItems) => {
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Free shipping for orders over ₹500 (common e-commerce rule)
  const shippingPrice = itemsPrice >= 500 ? 0 : 60;

  // 18% GST tax on items only (not on shipping)
  const taxPrice = Math.round(itemsPrice * 0.18);

  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  return {
    itemsPrice: Math.round(itemsPrice),
    shippingPrice,
    taxPrice,
    totalPrice: Math.round(totalPrice),
  };
};

// ─── @route   POST /api/orders ─────────────────────────────────────────────
// @desc    Place a new order from the user's current cart
// @access  Private
export const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "COD" } = req.body;

    // ── Validate shipping address ───────────────────────────────────────
    if (!shippingAddress) {
      return sendResponse(res, 400, "Shipping address is required");
    }

    const { fullName, phone, addressLine1, city, state, postalCode, country } =
      shippingAddress;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      return sendResponse(
        res,
        400,
        "Please provide complete shipping address: fullName, phone, addressLine1, city, state, postalCode"
      );
    }

    // ── Fetch user's cart ───────────────────────────────────────────────
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price discountedPrice stock images"
    );

    if (!cart || cart.items.length === 0) {
      return sendResponse(
        res,
        400,
        "Your cart is empty. Add items before placing an order."
      );
    }

    // ── Validate stock availability for ALL items before placing order ──
    // WHY: Check ALL items first before committing — don't partially succeed
    const stockErrors = [];
    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        stockErrors.push(`A product in your cart no longer exists`);
      } else if (product.stock < item.quantity) {
        stockErrors.push(
          `"${product.name}" only has ${product.stock} units left (you requested ${item.quantity})`
        );
      }
    }

    if (stockErrors.length > 0) {
      return sendResponse(res, 400, stockErrors.join(". "));
    }

    // ── Build order items (snapshot) ────────────────────────────────────
    // WHY: We snapshot name, image, price so the order remains accurate
    // even if product is later edited or deleted
    const orderItems = cart.items.map((item) => {
      const product = item.product;
      const finalPrice =
        product.discountedPrice > 0 ? product.discountedPrice : product.price;

      return {
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: finalPrice,
        quantity: item.quantity,
      };
    });

    // ── Calculate final prices ──────────────────────────────────────────
    const { itemsPrice, shippingPrice, taxPrice, totalPrice } =
      calculatePrices(orderItems);

    // ── Create the order document ───────────────────────────────────────
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress: {
        fullName,
        phone,
        addressLine1,
        addressLine2: shippingAddress.addressLine2 || "",
        city,
        state,
        postalCode,
        country: country || "India",
      },
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      status: "pending",
    });

    // ── Reduce stock for each ordered product ───────────────────────────
    // WHY: We decrement stock AFTER order is created.
    // If order creation fails, stock isn't touched.
    const stockUpdatePromises = cart.items.map((item) =>
      Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }, // Decrement stock by quantity ordered
      })
    );
    await Promise.all(stockUpdatePromises);

    // ── Clear the cart ──────────────────────────────────────────────────
    // WHY: Once order is placed, cart should be empty and ready for next purchase
    cart.items      = [];
    cart.totalPrice = 0;
    cart.totalItems = 0;
    await cart.save();

    return sendResponse(res, 201, "Order placed successfully! 🎉", { order });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return sendResponse(res, 400, messages.join(", "));
    }
    console.error("Place order error:", error);
    return sendResponse(res, 500, "Server error placing order");
  }
};

// ─── @route   GET /api/orders/my-orders ───────────────────────────────────
// @desc    Get the logged-in user's order history (newest first)
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 }) // Most recent first
      .select("-orderItems.product"); // Exclude the ref (snapshot fields are enough)

    return sendResponse(res, 200, "Orders fetched successfully", {
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    return sendResponse(res, 500, "Server error fetching orders");
  }
};

// ─── @route   GET /api/orders/:id ─────────────────────────────────────────
// @desc    Get a single order by ID (only owner or admin can view)
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return sendResponse(res, 404, "Order not found");
    }

    // ── Security check ──────────────────────────────────────────────────
    // A regular user can only view their OWN order
    // An admin can view ANY order
    const isOwner  = order.user._id.toString() === req.user._id.toString();
    const isAdmin  = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return sendResponse(res, 403, "Not authorized to view this order");
    }

    return sendResponse(res, 200, "Order fetched successfully", { order });
  } catch (error) {
    if (error.name === "CastError") {
      return sendResponse(res, 400, "Invalid order ID format");
    }
    console.error("Get order by ID error:", error);
    return sendResponse(res, 500, "Server error fetching order");
  }
};

// ─── @route   GET /api/orders ─────────────────────────────────────────────
// @desc    Get ALL orders — for admin dashboard (with pagination)
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    // Optional: filter by status for admin dashboard
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      Order.countDocuments(filter),
    ]);

    // Calculate summary stats for admin dashboard
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    return sendResponse(res, 200, "All orders fetched", {
      orders,
      pagination: {
        currentPage : pageNum,
        totalPages  : Math.ceil(totalCount / limitNum),
        totalOrders : totalCount,
      },
      stats: {
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    return sendResponse(res, 500, "Server error fetching all orders");
  }
};

// ─── @route   PUT /api/orders/:id/status ──────────────────────────────────
// @desc    Update order status (admin only)
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return sendResponse(
        res,
        400,
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return sendResponse(res, 404, "Order not found");
    }

    // ── Business rule: Can't change status of delivered/cancelled orders ─
    if (order.status === "delivered" || order.status === "cancelled") {
      return sendResponse(
        res,
        400,
        `Cannot update status of a ${order.status} order`
      );
    }

    // ── If cancelling — restore product stock ────────────────────────────
    if (status === "cancelled" && order.status !== "cancelled") {
      const restorePromises = order.orderItems.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: +item.quantity }, // Add stock back
        })
      );
      await Promise.all(restorePromises);
    }

    order.status = status;

    // ── Auto-set delivered fields when marked delivered ───────────────────
    if (status === "delivered") {
      order.isDelivered  = true;
      order.deliveredAt  = new Date();
    }

    await order.save();

    return sendResponse(res, 200, `Order status updated to "${status}"`, {
      order,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return sendResponse(res, 400, "Invalid order ID format");
    }
    console.error("Update order status error:", error);
    return sendResponse(res, 500, "Server error updating order status");
  }
};

// ─── @route   PUT /api/orders/:id/pay ─────────────────────────────────────
// @desc    Mark an order as paid (admin or payment gateway callback)
// @access  Private/Admin
export const markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return sendResponse(res, 404, "Order not found");
    }

    if (order.isPaid) {
      return sendResponse(res, 400, "Order is already marked as paid");
    }

    order.isPaid  = true;
    order.paidAt  = new Date();

    // If COD and marked paid → auto advance to processing
    if (order.status === "pending") {
      order.status = "processing";
    }

    await order.save();

    return sendResponse(res, 200, "Order marked as paid", { order });
  } catch (error) {
    if (error.name === "CastError") {
      return sendResponse(res, 400, "Invalid order ID format");
    }
    console.error("Mark as paid error:", error);
    return sendResponse(res, 500, "Server error marking order as paid");
  }
};
