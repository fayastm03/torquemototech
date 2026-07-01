// server.js
// WHY: This is the main entry point for our backend.
// It does 4 key things:
//  1. Loads environment variables from .env
//  2. Connects to MongoDB
//  3. Registers all middleware and routes
//  4. Starts the server on a port

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

// Internal imports
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Route imports (we'll fill these in Step 4-9)
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bikeRoutes from "./routes/bikeRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";


// ─── Load Environment Variables ──────────────────────────────────────────────
// dotenv reads our .env file and loads values into process.env
dotenv.config();

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Create Express App ───────────────────────────────────────────────────────
const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        "http://localhost:5173",
        process.env.CLIENT_URL
      ];
      
      const isAllowed = allowedOrigins.includes(origin) || 
                        origin.endsWith(".vercel.app") ||
                        origin.includes("vercel.app");
                        
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies/auth headers
  })
);

// express.json(): Parses incoming JSON request bodies
// Without this, req.body would be undefined
app.use(express.json());

// express.urlencoded(): Parses form data (URL-encoded bodies)
app.use(express.urlencoded({ extended: true }));

// Morgan: HTTP request logger — shows every request in the console
// Only use in development; remove or change in production
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Health Check Route ───────────────────────────────────────────────────────
// A simple GET / route to confirm the server is running
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🛒 E-Commerce API is running...",
    version: "1.0.0",
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
// All routes are prefixed with /api for clarity
// Example: POST /api/auth/login, GET /api/products
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/bookings", bookingRoutes);

// ─── Error Handling Middleware ────────────────────────────────────────────────
// IMPORTANT: These MUST be registered AFTER all routes
app.use(notFound);      // Handles 404 — route not found
app.use(errorHandler);  // Handles all other errors

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`
  );
});
