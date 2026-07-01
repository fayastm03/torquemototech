// components/product/ProductCard.jsx
// WHY: Reusable card for product grid listings. Handles display, wishlist toggling, and quick cart addition.

import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { formatPrice, isOnSale, getEffectivePrice, getDiscountPercent } from "../../utils/helpers";
import Button from "../common/Button";

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product._id, 1);
  };

  const handleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const isFav = isInWishlist(product._id);
  const inCart = isInCart(product._id);
  const sale = isOnSale(product);
  const finalPrice = getEffectivePrice(product);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-dark-100 transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/20 hover:shadow-card">
      
      {/* Product Image & Wishlist Button */}
      <Link to={`/shop/${product._id}`} className="relative block aspect-square w-full overflow-hidden bg-dark-200">
        {sale && (
          <span className="absolute left-3 top-3 z-10 rounded-lg bg-orange-500 px-2.5 py-1 text-xs font-bold text-black">
            -{getDiscountPercent(product.price, product.discountedPrice)}% OFF
          </span>
        )}
        <button
          onClick={handleWish}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 backdrop-blur-md transition-all duration-300 hover:scale-110 ${
            isFav 
              ? "bg-rose-500/20 border-rose-500/30 text-rose-400" 
              : "bg-black/40 text-slate-300 hover:text-white"
          }`}
          aria-label="Add to wishlist"
        >
          <FiHeart className={isFav ? "fill-current" : ""} size={16} />
        </button>
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {product.brand}
        </span>
        <Link to={`/shop/${product._id}`} className="mt-1 line-clamp-1 font-display text-sm font-bold text-white hover:text-primary-400 transition-colors">
          {product.name}
        </Link>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <span className="flex items-center gap-0.5 text-amber-400">
            <FiStar className="fill-current" size={14} />
          </span>
          <span className="font-semibold text-slate-300">{product.rating.toFixed(1)}</span>
          <span>({product.numReviews})</span>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-auto pt-4 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            {sale ? (
              <>
                <span className="text-xs text-slate-500 line-through">{formatPrice(product.price)}</span>
                <span className="font-display font-black text-lg text-white">{formatPrice(product.discountedPrice)}</span>
              </>
            ) : (
              <span className="font-display font-black text-lg text-white">{formatPrice(product.price)}</span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
              product.stock === 0
                ? "bg-white/5 text-slate-500 cursor-not-allowed"
                : inCart
                ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                : "bg-primary-500 text-white hover:scale-105 hover:bg-primary-600"
            }`}
            title={product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          >
            <FiShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
