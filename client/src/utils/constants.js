// utils/constants.js
// WHY: Centralised constants prevent magic strings scattered across the codebase.
// Change once here, reflects everywhere.

export const CATEGORIES = [
  "All",
  "Spare Parts",
  "Accessories",
  "Riding Gear",
  "Other",
];

export const SORT_OPTIONS = [
  { label: "Newest First",   value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Top Rated",      value: "rating" },
];

export const ORDER_STATUSES = {
  pending:    { label: "Pending",    color: "warning" },
  processing: { label: "Processing", color: "primary" },
  shipped:    { label: "Shipped",    color: "accent"  },
  delivered:  { label: "Delivered",  color: "success" },
  cancelled:  { label: "Cancelled",  color: "danger"  },
};

export const PAYMENT_METHODS = [
  { label: "Cash on Delivery", value: "COD"        },
  { label: "Credit / Debit Card", value: "Card"    },
  { label: "UPI",              value: "UPI"         },
  { label: "Net Banking",      value: "NetBanking"  },
];

export const ITEMS_PER_PAGE = 12;
export const MAX_RATING     = 5;
export const FREE_SHIPPING_THRESHOLD = 500;
export const GST_RATE       = 0.18;
export const SHIPPING_COST  = 60;
