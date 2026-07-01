// pages/ProductDetail.jsx
// WHY: Detailed overview of a store product, offering stock alerts, cart actions, review displays, and feedback forms.

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiShoppingCart, FiHeart, FiStar, FiChevronRight, FiCheck } from "react-icons/fi";
import { getProductById, addReview } from "../services/productService";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import { formatPrice, isOnSale, getEffectivePrice, getDiscountPercent } from "../utils/helpers";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Review inputs
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
    } catch (err) {
      console.error("Error fetching product details:", err);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleQtyChange = (val) => {
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= (product?.stock || 1)) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const success = await addToCart(product._id, quantity);
    if (success) {
      setQuantity(1);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      return toast.error("Please enter your comment");
    }

    try {
      setSubmittingReview(true);
      await addReview(product._id, { rating, comment });
      toast.success("Review submitted successfully! Thank you.");
      setComment("");
      setRating(5);
      fetchProduct(); // Reload product details to show new review
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-300 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-wrapper bg-dark-300 text-center py-24 text-slate-500">
        <p className="text-lg font-bold">Product not found</p>
        <Link to="/shop" className="text-orange-400 mt-4 inline-block hover:underline">Back to Store</Link>
      </div>
    );
  }

  const inCart = isInCart(product._id);
  const isFav = isInWishlist(product._id);
  const sale = isOnSale(product);
  const finalPrice = getEffectivePrice(product);

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100 animate-fade-in">
      <div className="container-custom">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-8 font-semibold">
          <Link to="/" className="hover:text-slate-300">Home</Link>
          <FiChevronRight />
          <Link to="/shop" className="hover:text-slate-300">Store</Link>
          <FiChevronRight />
          <span className="text-slate-300 truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-2xl overflow-hidden border border-white/5 bg-dark-100 relative group img-zoom">
              {sale && (
                <span className="absolute left-4 top-4 z-10 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-black shadow-lg">
                  -{getDiscountPercent(product.price, product.discountedPrice)}% OFF
                </span>
              )}
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-orange-400 uppercase tracking-widest">{product.brand}</span>
            <h1 className="font-display font-black text-3xl md:text-4xl text-white tracking-tight leading-tight mt-2 mb-4">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
              <span className="flex items-center gap-0.5 text-amber-400">
                <FiStar className="fill-current" size={16} />
              </span>
              <span className="font-bold text-slate-200">{product.rating.toFixed(1)}</span>
              <span>•</span>
              <span>{product.numReviews} ratings & comments</span>
            </div>

            {/* Price */}
            <div className="glass-card p-5 mb-8 bg-dark-100 border border-white/5">
              <span className="text-xs text-slate-500 block mb-1">Selling Price</span>
              <div className="flex items-baseline gap-3">
                <span className="font-display font-black text-3xl text-white">{formatPrice(finalPrice)}</span>
                {sale && (
                  <span className="text-sm text-slate-500 line-through">{formatPrice(product.price)}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{product.description}</p>
            </div>

            {/* Stock Alert */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                  <FiCheck size={14} /> In Stock ({product.stock} units left)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Purchase Action Panel */}
            {product.stock > 0 && (
              <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center gap-4">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-dark-200">
                    <button
                      onClick={() => handleQtyChange(-1)}
                      className="qty-btn"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                    <button
                      onClick={() => handleQtyChange(1)}
                      className="qty-btn"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to cart */}
                  <Button
                    onClick={handleAddToCart}
                    variant={inCart ? "ghost" : "accent"}
                    className="flex-1 flex justify-center items-center gap-2"
                  >
                    <FiShoppingCart size={18} /> {inCart ? "Add More to Basket" : "Add to Basket"}
                  </Button>

                  {/* Wishlist toggle */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 transition-all ${
                      isFav
                        ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                        : "bg-dark-100 text-slate-400 hover:text-white"
                    }`}
                  >
                    <FiHeart className={isFav ? "fill-current" : ""} size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── REVIEWS SECTION ────────────────────────────────────────────── */}
        <section className="border-t border-white/5 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="font-display font-black text-xl text-white">Customer Reviews ({product.numReviews})</h3>
              
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((rev) => (
                    <div key={rev._id} className="glass-card p-5 bg-dark-100 border border-white/5">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="font-bold text-sm text-slate-200">{rev.name}</span>
                        <span className="text-[10px] text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={i < rev.rating ? "fill-current" : "text-white/10"} size={12} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-6">No customer reviews yet. Be the first to share your thoughts!</p>
              )}
            </div>

            {/* Add Review Form */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 bg-dark-100 border border-white/5">
                <h4 className="font-display font-black text-base text-white mb-4">Write a Review</h4>
                
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="form-label">Product Rating</label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="form-input py-2"
                      >
                        <option value="5" className="bg-dark-100">5 Stars - Excellent</option>
                        <option value="4" className="bg-dark-100">4 Stars - Very Good</option>
                        <option value="3" className="bg-dark-100">3 Stars - Good</option>
                        <option value="2" className="bg-dark-100">2 Stars - Fair</option>
                        <option value="1" className="bg-dark-100">1 Star - Bad</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Your Comment</label>
                      <textarea
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your review here..."
                        className="form-input resize-none text-xs"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="accent"
                      size="sm"
                      fullWidth
                      loading={submittingReview}
                    >
                      Submit Review
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-500 leading-normal">
                    <p className="mb-4">Please log in to submit a review for this product.</p>
                    <Link to="/login">
                      <Button variant="outline" size="sm" fullWidth>Login to Review</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default ProductDetail;
