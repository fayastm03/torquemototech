// utils/sendResponse.js
// WHY: A utility to send consistent JSON responses across all controllers.
// Instead of writing res.status().json() every time, we call sendResponse().
// This makes our API responses uniform — every response has: success, message, data.

const sendResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: statusCode >= 200 && statusCode < 300,
    message,
  };

  // Only include data if it's provided
  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

export default sendResponse;
