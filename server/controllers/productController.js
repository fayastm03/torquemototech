// controllers/productController.js
// WHY: Handles all product-related business logic.
// Covers public browsing (list, search, filter) AND admin management (CRUD).
//
// Key features:
//  - Powerful query builder: search + category filter + price sort + pagination
//  - Admin-only: create, update, delete products
//  - Any logged-in user can add a review (once per product)

import Product from "../models/Product.js";
import sendResponse from "../utils/sendResponse.js";

// ─── @route   GET /api/products ────────────────────────────────────────────
// @desc    Get all products with search, filter, sort & pagination
// @access  Public
export const getProducts = async (req, res) => {
  try {
    // ── Read query params from URL ──────────────────────────────────────
    // Example: GET /api/products?search=phone&category=Electronics&sort=price_asc&page=2
    const {
      search,
      category,
      sort,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
    } = req.query;

    // ── Build the filter object dynamically ─────────────────────────────
    // WHY: We only add conditions that were actually sent — unused filters are ignored
    const filter = {};

    // Text search: matches name OR description
    // Uses the text index we created in the Product model
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    // Category filter (exact match from enum list)
    if (category && category !== "All") {
      filter.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice); // Greater than or equal
      if (maxPrice) filter.price.$lte = Number(maxPrice); // Less than or equal
    }

    // ── Build the sort object ───────────────────────────────────────────
    let sortOption = { createdAt: -1 }; // Default: newest first

    if (sort === "price_asc")  sortOption = { price: 1 };   // Low to High
    if (sort === "price_desc") sortOption = { price: -1 };  // High to Low
    if (sort === "rating")     sortOption = { rating: -1 }; // Top Rated
    if (sort === "newest")     sortOption = { createdAt: -1 };

    // ── Pagination ──────────────────────────────────────────────────────
    const pageNum  = Math.max(1, parseInt(page));       // Ensure page >= 1
    const limitNum = Math.min(50, parseInt(limit));     // Max 50 per page
    const skip     = (pageNum - 1) * limitNum;          // Items to skip

    // ── Execute DB queries ──────────────────────────────────────────────
    // Run both queries in parallel using Promise.all (faster!)
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .select("-reviews"),  // Exclude reviews from list (load them in detail page)

      Product.countDocuments(filter), // Total matching documents (for pagination UI)
    ]);

    return sendResponse(res, 200, "Products fetched successfully", {
      products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalProducts: totalCount,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return sendResponse(res, 500, "Server error fetching products");
  }
};

// ─── @route   GET /api/products/featured ──────────────────────────────────
// @desc    Get featured products for the Home page hero/section
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    let products = await Product.find({ isFeatured: true })
      .limit(8)
      .select("-reviews")
      .sort({ createdAt: -1 });

    // Fallback: If no products are flagged as featured, return the latest 8 products
    if (!products || products.length === 0) {
      products = await Product.find({})
        .limit(8)
        .select("-reviews")
        .sort({ createdAt: -1 });
    }

    return sendResponse(res, 200, "Featured products fetched", { products });
  } catch (error) {
    console.error("Get featured products error:", error);
    return sendResponse(res, 500, "Server error fetching featured products");
  }
};

// ─── @route   GET /api/products/categories ────────────────────────────────
// @desc    Get list of all unique categories (for filter sidebar)
// @access  Public
export const getCategories = async (req, res) => {
  try {
    // MongoDB distinct() returns unique values for a field
    const categories = await Product.distinct("category");
    return sendResponse(res, 200, "Categories fetched", { categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return sendResponse(res, 500, "Server error fetching categories");
  }
};

// ─── @route   GET /api/products/:id ───────────────────────────────────────
// @desc    Get a single product with full details including reviews
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "reviews.user",
      "name avatar" // Only get name and avatar from the User document
    );

    if (!product) {
      return sendResponse(res, 404, "Product not found");
    }

    return sendResponse(res, 200, "Product fetched successfully", { product });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === "CastError") {
      return sendResponse(res, 400, "Invalid product ID format");
    }
    console.error("Get product by ID error:", error);
    return sendResponse(res, 500, "Server error fetching product");
  }
};

// ─── @route   POST /api/products ──────────────────────────────────────────
// @desc    Create a new product
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountedPrice,
      category,
      stock,
      images,
      isFeatured,
      brand,
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !images || images.length === 0) {
      return sendResponse(
        res,
        400,
        "Please provide name, description, price, category, and at least one image"
      );
    }

    const product = await Product.create({
      name,
      description,
      price,
      discountedPrice: discountedPrice || 0,
      category,
      stock: stock || 0,
      images,
      isFeatured: isFeatured || false,
      brand: brand || "",
      createdBy: req.user._id, // Set from the protect middleware
    });

    return sendResponse(res, 201, "Product created successfully", { product });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return sendResponse(res, 400, messages.join(", "));
    }
    console.error("Create product error:", error);
    return sendResponse(res, 500, "Server error creating product");
  }
};

// ─── @route   PUT /api/products/:id ───────────────────────────────────────
// @desc    Update an existing product
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendResponse(res, 404, "Product not found");
    }

    // Destructure allowed update fields from request body
    const {
      name,
      description,
      price,
      discountedPrice,
      category,
      stock,
      images,
      isFeatured,
      brand,
    } = req.body;

    // Update only the fields that were provided
    // WHY: Using Object.assign or individual checks prevents overwriting
    // fields with undefined if they weren't sent in the request
    if (name !== undefined)            product.name = name;
    if (description !== undefined)     product.description = description;
    if (price !== undefined)           product.price = price;
    if (discountedPrice !== undefined) product.discountedPrice = discountedPrice;
    if (category !== undefined)        product.category = category;
    if (stock !== undefined)           product.stock = stock;
    if (images !== undefined)          product.images = images;
    if (isFeatured !== undefined)      product.isFeatured = isFeatured;
    if (brand !== undefined)           product.brand = brand;

    const updatedProduct = await product.save();

    return sendResponse(res, 200, "Product updated successfully", {
      product: updatedProduct,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return sendResponse(res, 400, "Invalid product ID format");
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return sendResponse(res, 400, messages.join(", "));
    }
    console.error("Update product error:", error);
    return sendResponse(res, 500, "Server error updating product");
  }
};

// ─── @route   DELETE /api/products/:id ────────────────────────────────────
// @desc    Delete a product
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendResponse(res, 404, "Product not found");
    }

    await product.deleteOne();

    return sendResponse(res, 200, "Product deleted successfully");
  } catch (error) {
    if (error.name === "CastError") {
      return sendResponse(res, 400, "Invalid product ID format");
    }
    console.error("Delete product error:", error);
    return sendResponse(res, 500, "Server error deleting product");
  }
};

// ─── @route   POST /api/products/:id/reviews ──────────────────────────────
// @desc    Add a review to a product
// @access  Private (logged in users only)
export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return sendResponse(res, 400, "Please provide rating and comment");
    }

    if (rating < 1 || rating > 5) {
      return sendResponse(res, 400, "Rating must be between 1 and 5");
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendResponse(res, 404, "Product not found");
    }

    // ── Check if user already reviewed this product ─────────────────────
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return sendResponse(res, 400, "You have already reviewed this product");
    }

    // ── Add the new review ──────────────────────────────────────────────
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);

    // ── Recalculate average rating ──────────────────────────────────────
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    await product.save();

    return sendResponse(res, 201, "Review added successfully");
  } catch (error) {
    if (error.name === "CastError") {
      return sendResponse(res, 400, "Invalid product ID format");
    }
    console.error("Add review error:", error);
    return sendResponse(res, 500, "Server error adding review");
  }
};
