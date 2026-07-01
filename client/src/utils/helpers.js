// utils/helpers.js
// WHY: Pure utility functions used across multiple components.
// Keeping them here makes them easy to test and reuse.

// ── Format price in Indian Rupee format ───────────────────────────────────
// Example: 134900 → "₹1,34,900"
export const formatPrice = (amount) => {
  if (amount === undefined || amount === null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style:    "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// ── Calculate discount percentage ─────────────────────────────────────────
export const getDiscountPercent = (original, discounted) => {
  if (!discounted || discounted >= original) return 0;
  return Math.round(((original - discounted) / original) * 100);
};

// ── Truncate long strings ──────────────────────────────────────────────────
export const truncate = (str, maxLen = 60) => {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
};

// ── Get order status badge color ───────────────────────────────────────────
export const getStatusColor = (status) => {
  const colors = {
    pending:    "warning",
    processing: "primary",
    shipped:    "accent",
    delivered:  "success",
    cancelled:  "danger",
  };
  return colors[status] || "primary";
};

// ── Format date ────────────────────────────────────────────────────────────
// Example: "2024-01-15T10:30:00Z" → "15 Jan 2024"
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
};

// ── Get API error message ──────────────────────────────────────────────────
// Extracts the readable error message from Axios error responses
export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};

// ── Check if product is on sale ────────────────────────────────────────────
export const isOnSale = (product) =>
  product?.discountedPrice > 0 && product.discountedPrice < product.price;

// ── Get effective price (discounted if available) ──────────────────────────
export const getEffectivePrice = (product) =>
  isOnSale(product) ? product.discountedPrice : product.price;

// ── Generate star array for ratings ───────────────────────────────────────
// Example: rating=3.7 → [1,1,1,0.7,0]
export const getStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push(1);
    else if (i - rating < 1)    stars.push(rating - Math.floor(rating));
    else                         stars.push(0);
  }
  return stars;
};

// ── Scroll to top ──────────────────────────────────────────────────────────
export const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

// ── Debounce ───────────────────────────────────────────────────────────────
// WHY: Prevents search from firing on every single keystroke
export const debounce = (fn, delay = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
