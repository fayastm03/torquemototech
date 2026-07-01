// middleware/authMiddleware.js
// WHY: This middleware "guards" private routes.
// Before a protected route runs, this function intercepts the request,
// checks the JWT token, and either:
//   ✅ Attaches the user to req.user and calls next() — request proceeds
//   ❌ Returns a 401 Unauthorized error — request blocked
//
// How JWT works in our app:
//   1. User logs in → server returns a JWT token
//   2. Client stores the token (localStorage)
//   3. Client sends token in the Authorization header on every request:
//      Authorization: Bearer <token>
//   4. This middleware reads and verifies that token

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ─── Protect Middleware ────────────────────────────────────────────────────
// Use this on any route that requires the user to be logged in
export const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with "Bearer"
  // Format: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // Extract token after "Bearer "
  }

  // If no token found, block the request
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized — no token provided. Please log in.",
    });
  }

  try {
    // jwt.verify() decodes the token AND checks if it's valid + not expired
    // If tampered or expired, it throws an error caught below
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded = { id: "userId123", iat: ..., exp: ... }
    // Fetch the user from DB using the ID stored in the token
    // We use .select("-password") to exclude the hashed password from the result
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    next(); // ✅ Token is valid, user found — proceed to the actual route handler
  } catch (error) {
    // Handle specific JWT errors with clear messages
    let message = "Not authorized — invalid token.";

    if (error.name === "TokenExpiredError") {
      message = "Your session has expired. Please log in again.";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid token. Please log in again.";
    }

    return res.status(401).json({ success: false, message });
  }
};

// ─── Admin Middleware ──────────────────────────────────────────────────────
// WHY: Some routes (add product, manage users) should only be accessible
// by admins. This middleware runs AFTER protect() to also check the role.
//
// Usage in routes: router.get("/admin/users", protect, admin, controller)
//                                                          ↑ runs second
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // ✅ User is an admin — proceed
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied — admin privileges required.",
    });
  }
};
