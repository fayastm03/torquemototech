// pages/Cart.jsx
// WHY: Cart interface displaying snapped store items, facilitating changes, and redirecting to checkout.

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import Button from "../components/common/Button";
import { formatPrice } from "../utils/helpers";
import { FREE_SHIPPING_THRESHOLD, GST_RATE, SHIPPING_COST } from "../utils/constants";

const Cart = () => {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQtyChange = (itemId, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty >= 1) {
      updateQuantity(itemId, newQty);
    }
  };

  const handleRemove = (itemId) => {
    removeItem(itemId);
  };

  const itemsPrice = cart.totalPrice || 0;
  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD || itemsPrice === 0 ? 0 : SHIPPING_COST;
  const taxPrice = Math.round(itemsPrice * GST_RATE);
  const finalPrice = itemsPrice + shippingPrice + taxPrice;

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100 animate-fade-in">
      <div className="container-custom">
        
        {/* Title */}
        <div className="mb-8">
          <span className="text-sm font-bold text-orange-400 uppercase tracking-widest font-display">Checkout Step 1</span>
          <h1 className="section-title mt-2">Your Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">Review parts, tools or accessories in your basket</p>
        </div>

        {cart.items && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center px-4 py-2 border-b border-white/5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Products</span>
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                  <FiTrash2 size={13} /> Clear Basket
                </button>
              </div>

              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="glass-card p-5 bg-dark-100 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  {/* Thumbnail & Title */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-dark-200 border border-white/5 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <Link to={`/shop/${item.product?._id || item.product}`} className="font-display font-black text-sm text-white hover:text-orange-400 transition-colors line-clamp-1">
                        {item.name}
                      </Link>
                      <span className="text-xs text-slate-500 mt-1 block">Unit price: {formatPrice(item.price)}</span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-dark-200">
                      <button
                        onClick={() => handleQtyChange(item._id, item.quantity, -1)}
                        className="qty-btn"
                        aria-label="Decrease quantity"
                      >
                        <FiMinus size={12} />
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item._id, item.quantity, 1)}
                        className="qty-btn"
                        aria-label="Increase quantity"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>

                    {/* Total Price */}
                    <div className="text-right min-w-[90px]">
                      <span className="font-display font-black text-sm text-white">{formatPrice(item.price * item.quantity)}</span>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      aria-label="Remove item"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 bg-dark-100 border border-white/5">
                <h3 className="font-display font-black text-lg text-white mb-6">Order Summary</h3>

                <div className="space-y-4 text-sm border-b border-white/5 pb-6">
                  <div className="flex justify-between text-slate-400">
                    <span>Items Subtotal</span>
                    <span className="text-slate-200 font-semibold">{formatPrice(itemsPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST Tax (18%)</span>
                    <span className="text-slate-200 font-semibold">{formatPrice(taxPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping Charges</span>
                    <span className="text-slate-200 font-semibold">
                      {shippingPrice === 0 ? <span className="text-emerald-400">FREE</span> : formatPrice(shippingPrice)}
                    </span>
                  </div>
                  {shippingPrice > 0 && (
                    <p className="text-[10px] text-slate-500 leading-normal">
                      * Add {formatPrice(FREE_SHIPPING_THRESHOLD - itemsPrice)} more worth items to avail FREE shipping.
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center py-6">
                  <span className="font-bold text-white text-base">Net Total</span>
                  <span className="font-display font-black text-2xl text-orange-400">{formatPrice(finalPrice)}</span>
                </div>

                <Button
                  onClick={() => navigate("/checkout")}
                  variant="accent"
                  fullWidth
                  className="flex justify-center items-center gap-1.5"
                >
                  Proceed to Checkout <FiArrowRight size={16} />
                </Button>
              </div>
            </div>

          </div>
        ) : (
          <div className="glass-card p-16 text-center bg-dark-100 border border-white/5 text-slate-500">
            <div className="w-16 h-16 rounded-full bg-dark-200 flex items-center justify-center text-slate-400 mx-auto mb-6 border border-white/5">
              <FiShoppingBag size={28} />
            </div>
            <p className="text-lg font-bold mb-2">Your cart is currently empty</p>
            <p className="text-sm">Add chains, gear, helmets, or spare parts from our store.</p>
            <Button onClick={() => navigate("/shop")} variant="accent" className="mt-8">
              Browse Accessories & Spares
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;
