// models/Product.js
// WHY: Defines the structure for every product in the shop.
//
// Key decisions:
//  - images is an array so one product can have multiple photos
//  - ratings are embedded (subdocuments) — fast to read, no extra query needed
//  - category uses enum to restrict to a fixed set of valid values
//  - numReviews is tracked separately for quick display (avoid counting each time)

import mongoose from "mongoose";

// ─── Review Subdocument Schema ─────────────────────────────────────────────
// WHY: Each product can have multiple reviews. We embed them directly
// inside the product document (no separate Review collection needed).
// This is efficient because reviews are always loaded WITH the product.
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// ─── Main Product Schema ───────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    // Who created this product (admin user)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      // We store price in full rupees (or dollars), not paise/cents
    },

    // discountedPrice is optional — used for sale/offer items
    discountedPrice: {
      type: Number,
      default: 0,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Spare Parts",
        "Accessories",
        "Riding Gear",
        "Other",
      ],
    },

    // Array of image URLs (first image is the main/cover image)
    images: [
      {
        type: String,
        required: true,
      },
    ],

    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    // Embedded reviews array (using the sub-schema defined above)
    reviews: [reviewSchema],

    // Average rating — calculated whenever a new review is added
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // Total number of reviews — stored for fast display
    numReviews: {
      type: Number,
      default: 0,
    },

    // Featured products appear on the Home page
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Brand name (optional)
    brand: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt, updatedAt
  }
);

// ─── Index for Search Performance ─────────────────────────────────────────────
// WHY: When users search by name or filter by category, MongoDB
// uses these indexes instead of scanning the entire collection.
// This makes searches MUCH faster as the dataset grows.
productSchema.index({ name: "text", description: "text" }); // Full-text search
productSchema.index({ category: 1 });                        // Category filter
productSchema.index({ price: 1 });                           // Price sort

const Product = mongoose.model("Product", productSchema);

export default Product;
