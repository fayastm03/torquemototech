// pages/Wishlist.jsx
// WHY: Wishlist catalog showroom displaying liked products.

import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiHeart, FiGift } from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/product/ProductCard";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";

const Wishlist = () => {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100 animate-fade-in">
      <div className="container-custom">
        
        {/* Title */}
        <div className="mb-8">
          <span className="text-sm font-bold text-orange-400 uppercase tracking-widest font-display">Account</span>
          <h1 className="section-title mt-2">Your Wishlist</h1>
          <p className="text-xs text-slate-500 mt-1">Review saved accessories, spares, or riding gears</p>
        </div>

        {wishlist && wishlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              // Sometimes wishlist contains populated objects, sometimes just strings.
              // Handle safety checks here.
              typeof product === "object" && product !== null ? (
                <ProductCard key={product._id} product={product} />
              ) : null
            ))}
          </div>
        ) : (
          <div className="glass-card p-16 text-center bg-dark-100 border border-white/5 text-slate-500">
            <div className="w-16 h-16 rounded-full bg-dark-200 flex items-center justify-center text-slate-400 mx-auto mb-6 border border-white/5">
              <FiHeart size={28} />
            </div>
            <p className="text-lg font-bold mb-2">Your wishlist is currently empty</p>
            <p className="text-sm">Save products you like to purchase them later.</p>
            <Button onClick={() => navigate("/shop")} variant="accent" className="mt-8">
              Explore Store
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Wishlist;
