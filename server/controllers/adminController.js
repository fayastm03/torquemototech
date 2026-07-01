// controllers/adminController.js
// WHY: Admin-specific operations that go beyond the normal user scope.
// All functions here require BOTH protect + admin middleware.
//
// Covers:
//  - Dashboard: aggregated business stats (revenue, counts, recent activity)
//  - User management: list, view, update role, delete
//
// Note: Product CRUD and Order management are already handled in their own
// controllers with admin guards — this file focuses on admin-specific views.

import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import sendResponse from "../utils/sendResponse.js";

// ─── @route   GET /api/admin/dashboard ────────────────────────────────────
// @desc    Get business overview stats for admin dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // ── Run all DB queries in PARALLEL for maximum speed ────────────────
    // WHY: Promise.all() fires all queries at the same time instead of
    // waiting for each one — much faster than sequential queries
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueData,
      ordersByStatus,
      recentOrders,
      topProducts,
      lowStockProducts,
      newUsersThisMonth,
    ] = await Promise.all([

      // 1. Total user count (excluding admins)
      User.countDocuments({ role: "user" }),

      // 2. Total product count
      Product.countDocuments(),

      // 3. Total order count
      Order.countDocuments(),

      // 4. Total revenue — sum of totalPrice for non-cancelled orders
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),

      // 5. Orders grouped by status (for status breakdown chart)
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // 6. Last 5 orders for recent activity feed
      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("user totalPrice status createdAt orderItems"),

      // 7. Top 5 products by rating
      Product.find()
        .sort({ rating: -1, numReviews: -1 })
        .limit(5)
        .select("name price rating numReviews images stock category"),

      // 8. Products with low stock (≤ 5 units) — needs attention
      Product.find({ stock: { $lte: 5 } })
        .sort({ stock: 1 })
        .limit(10)
        .select("name stock category images"),

      // 9. New users registered this calendar month
      User.countDocuments({
        role: "user",
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
    ]);

    // ── Monthly revenue for last 6 months (for chart) ───────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year : { $year:  "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // ── Format monthly revenue for frontend charts ───────────────────────
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun",
                        "Jul","Aug","Sep","Oct","Nov","Dec"];

    const formattedMonthly = monthlyRevenue.map((m) => ({
      month  : monthNames[m._id.month - 1],
      year   : m._id.year,
      revenue: Math.round(m.revenue),
      orders : m.orders,
    }));

    // ── Build the status breakdown object ────────────────────────────────
    const statusBreakdown = {};
    ordersByStatus.forEach((s) => {
      statusBreakdown[s._id] = s.count;
    });

    return sendResponse(res, 200, "Dashboard stats fetched", {
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue    : Math.round(revenueData[0]?.total || 0),
        newUsersThisMonth,
      },
      ordersByStatus : statusBreakdown,
      monthlyRevenue : formattedMonthly,
      recentOrders,
      topProducts,
      lowStockProducts,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return sendResponse(res, 500, "Server error fetching dashboard stats");
  }
};

// ─── @route   GET /api/admin/users ────────────────────────────────────────
// @desc    Get all users with pagination and search
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    // ── Build filter ─────────────────────────────────────────────────────
    const filter = {};

    if (role && role !== "all") {
      filter.role = role;
    }

    if (search && search.trim()) {
      // Search by name OR email (case-insensitive)
      filter.$or = [
        { name:  { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select("-password")  // Never return hashed passwords
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      User.countDocuments(filter),
    ]);

    return sendResponse(res, 200, "Users fetched successfully", {
      users,
      pagination: {
        currentPage: pageNum,
        totalPages : Math.ceil(totalCount / limitNum),
        totalUsers : totalCount,
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return sendResponse(res, 500, "Server error fetching users");
  }
};

// ─── @route   GET /api/admin/users/:id ────────────────────────────────────
// @desc    Get a single user's details + their order history
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return sendResponse(res, 404, "User not found");
    }

    // Also fetch the user's order history for admin view
    const orders = await Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .select("totalPrice status createdAt orderItems");

    return sendResponse(res, 200, "User fetched successfully", {
      user,
      orders,
      orderCount: orders.length,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return sendResponse(res, 400, "Invalid user ID format");
    }
    console.error("Get user by ID error:", error);
    return sendResponse(res, 500, "Server error fetching user");
  }
};

// ─── @route   PUT /api/admin/users/:id ────────────────────────────────────
// @desc    Update user details (name, email, role)
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendResponse(res, 404, "User not found");
    }

    // ── Prevent admin from accidentally removing their own admin access ──
    if (
      req.params.id === req.user._id.toString() &&
      req.body.role === "user"
    ) {
      return sendResponse(
        res,
        400,
        "You cannot remove your own admin privileges"
      );
    }

    const { name, email, role } = req.body;

    // Only update provided fields
    if (name)  user.name  = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (role && ["user", "admin"].includes(role)) {
      user.role = role;
    }

    const updatedUser = await user.save();

    return sendResponse(res, 200, "User updated successfully", {
      user: {
        _id      : updatedUser._id,
        name     : updatedUser.name,
        email    : updatedUser.email,
        role     : updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return sendResponse(res, 400, "Invalid user ID format");
    }
    if (error.code === 11000) {
      return sendResponse(res, 400, "Email already in use by another account");
    }
    console.error("Update user error:", error);
    return sendResponse(res, 500, "Server error updating user");
  }
};

// ─── @route   DELETE /api/admin/users/:id ─────────────────────────────────
// @desc    Delete a user account
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    // ── Prevent admin from deleting their own account ───────────────────
    if (req.params.id === req.user._id.toString()) {
      return sendResponse(res, 400, "You cannot delete your own account");
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return sendResponse(res, 404, "User not found");
    }

    // Prevent deleting another admin (safety check)
    if (user.role === "admin") {
      return sendResponse(
        res,
        400,
        "Cannot delete an admin account. Change their role to 'user' first."
      );
    }

    await user.deleteOne();

    return sendResponse(res, 200, `User "${user.name}" deleted successfully`);
  } catch (error) {
    if (error.name === "CastError") {
      return sendResponse(res, 400, "Invalid user ID format");
    }
    console.error("Delete user error:", error);
    return sendResponse(res, 500, "Server error deleting user");
  }
};
