// middleware/errorMiddleware.js
// WHY: Express has a special 4-argument middleware for error handling.
// Any time we call next(error) from a controller, Express routes it here.
// This gives us one central place to handle ALL errors cleanly.

// 404 Handler — fires when no route matches the request
export const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found: ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass to the error handler below
};

// Global Error Handler — must have 4 params for Express to recognize it
export const errorHandler = (err, req, res, next) => {
  // Sometimes Express gives a 200 even on error — force it to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Only show stack trace in development mode (not in production)
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
};
