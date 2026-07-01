// controllers/authController.js
// WHY: Contains all the logic for user authentication.
// Controllers receive req, perform logic, and send res.
// They are kept separate from routes to keep code organized and testable.
//
// Endpoints handled here:
//   POST   /api/auth/register   → Create new user account
//   POST   /api/auth/login      → Login and get JWT token
//   GET    /api/auth/me         → Get logged-in user's profile
//   PUT    /api/auth/me         → Update profile (name, avatar)
//   PUT    /api/auth/password   → Change password

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendResponse from "../utils/sendResponse.js";

// ─── Helper: Format User for Response ─────────────────────────────────────
// WHY: We never want to accidentally send the password in a response.
// This helper creates a clean user object for API responses.
const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  wishlist: user.wishlist,
  createdAt: user.createdAt,
});

// ─── @route   POST /api/auth/register ─────────────────────────────────────
// @desc    Register a new user
// @access  Public (anyone can register)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Validate input ──────────────────────────────────────────────────
    if (!name || !email || !password) {
      return sendResponse(res, 400, "Please provide name, email, and password");
    }

    // ── Check for existing user ─────────────────────────────────────────
    // MongoDB unique index also enforces this, but we give a friendlier error
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendResponse(res, 400, "An account with this email already exists");
    }

    // ── Create user ─────────────────────────────────────────────────────
    // Password hashing happens automatically in the pre-save hook (User model)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // ── Generate JWT token ──────────────────────────────────────────────
    const token = generateToken(user._id);

    // ── Send response ───────────────────────────────────────────────────
    return sendResponse(res, 201, "Account created successfully!", {
      token,
      user: formatUser(user),
    });
  } catch (error) {
    // Handle Mongoose validation errors (e.g., email format, min length)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return sendResponse(res, 400, messages.join(", "));
    }
    console.error("Register error:", error);
    return sendResponse(res, 500, "Server error during registration");
  }
};

// ─── @route   POST /api/auth/login ────────────────────────────────────────
// @desc    Login user and return JWT token
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validate input ──────────────────────────────────────────────────
    if (!email || !password) {
      return sendResponse(res, 400, "Please provide email and password");
    }

    // ── Find user by email ──────────────────────────────────────────────
    // IMPORTANT: We must use .select("+password") because password has
    // select: false in the schema — it's excluded from queries by default
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    // ── Verify credentials ──────────────────────────────────────────────
    // SECURITY: We give the same vague error for "user not found" AND
    // "wrong password" — this prevents attackers from knowing which emails exist
    if (!user || !(await user.matchPassword(password))) {
      return sendResponse(res, 401, "Invalid email or password");
    }

    // ── Generate JWT token ──────────────────────────────────────────────
    const token = generateToken(user._id);

    return sendResponse(res, 200, "Login successful!", {
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendResponse(res, 500, "Server error during login");
  }
};

// ─── @route   GET /api/auth/me ─────────────────────────────────────────────
// @desc    Get currently logged-in user's profile
// @access  Private (requires JWT token)
export const getMe = async (req, res) => {
  try {
    // req.user is attached by the protect middleware (already fetched from DB)
    // We re-fetch to ensure we have the latest data and populate wishlist
    const user = await User.findById(req.user._id).populate(
      "wishlist",
      "name price images rating category" // Only get these fields from Product
    );

    if (!user) {
      return sendResponse(res, 404, "User not found");
    }

    return sendResponse(res, 200, "Profile fetched successfully", formatUser(user));
  } catch (error) {
    console.error("Get profile error:", error);
    return sendResponse(res, 500, "Server error fetching profile");
  }
};

// ─── @route   PUT /api/auth/me ─────────────────────────────────────────────
// @desc    Update logged-in user's name or avatar
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendResponse(res, 404, "User not found");
    }

    // Only update fields that were actually sent in the request
    if (name) user.name = name.trim();
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    return sendResponse(res, 200, "Profile updated successfully", formatUser(updatedUser));
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return sendResponse(res, 400, messages.join(", "));
    }
    console.error("Update profile error:", error);
    return sendResponse(res, 500, "Server error updating profile");
  }
};

// ─── @route   PUT /api/auth/password ──────────────────────────────────────
// @desc    Change logged-in user's password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendResponse(res, 400, "Please provide current and new password");
    }

    if (newPassword.length < 6) {
      return sendResponse(res, 400, "New password must be at least 6 characters");
    }

    // Fetch user with password (excluded by default)
    const user = await User.findById(req.user._id).select("+password");

    // Verify current password is correct
    if (!(await user.matchPassword(currentPassword))) {
      return sendResponse(res, 401, "Current password is incorrect");
    }

    // Set new password — pre-save hook will hash it automatically
    user.password = newPassword;
    await user.save();

    // Issue a new token so the client stays logged in
    const token = generateToken(user._id);

    return sendResponse(res, 200, "Password changed successfully", { token });
  } catch (error) {
    console.error("Change password error:", error);
    return sendResponse(res, 500, "Server error changing password");
  }
};

// ─── @route   POST /api/auth/logout ───────────────────────────────────────
// @desc    Logout (client-side — just confirms logout)
// @access  Private
// WHY: JWT is stateless — the server can't "invalidate" a token.
// Logout is handled client-side by deleting the stored token.
// This endpoint just confirms the action and can be extended
// for token blacklisting (Redis) in a production app.
export const logoutUser = async (req, res) => {
  return sendResponse(res, 200, "Logged out successfully");
};
