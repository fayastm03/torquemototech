// pages/Checkout.jsx
// WHY: Formulates shipping address inputs, displays order snapshots, and places orders.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiCreditCard, FiCheckCircle, FiInfo } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import Button from "../components/common/Button";
import { formatPrice } from "../utils/helpers";
import { FREE_SHIPPING_THRESHOLD, GST_RATE, SHIPPING_COST, PAYMENT_METHODS } from "../utils/constants";
import toast from "react-hot-toast";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  // Address inputs
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(false);

  // Bounce users back if cart is empty
  useEffect(() => {
    if (!loading && (!cart.items || cart.items.length === 0)) {
      toast.error("Your cart is empty. Please add products first.");
      navigate("/shop");
    }
  }, [cart, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      return toast.error("Please fill in all required shipping address fields");
    }

    try {
      setLoading(true);
      const orderPayload = {
        paymentMethod,
        shippingAddress: {
          fullName,
          phone,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country: "India",
        },
      };

      const { data } = await api.post("/orders", orderPayload);
      toast.success("Order placed successfully! 🎉");
      
      // Clear cart globally in React state
      await clearCart();
      
      // Redirect to Order Detail
      navigate(`/orders/${data.data.order._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to place your order. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <span className="text-sm font-bold text-orange-400 uppercase tracking-widest font-display">Checkout Step 2</span>
          <h1 className="section-title mt-2">Shipping & Payment</h1>
          <p className="text-xs text-slate-500 mt-1">Specify delivery details and select your payment choice</p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Shipping Address Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 md:p-8 bg-dark-100 border border-white/5">
              <h3 className="font-display font-black text-xl text-white mb-6 flex items-center gap-2">
                <FiMapPin className="text-orange-500" /> Shipping Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="form-label">Full Recipient Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Kumar"
                    className="form-input"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="form-label">Contact Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="form-input"
                    required
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="form-label">Postal / PIN Code *</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 670621"
                    className="form-input"
                    required
                  />
                </div>

                {/* Address Line 1 */}
                <div className="md:col-span-2">
                  <label className="form-label">Address Line 1 (House, Apartment, Street) *</label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="e.g. Door No 12B, Koyyode Road"
                    className="form-input"
                    required
                  />
                </div>

                {/* Address Line 2 */}
                <div className="md:col-span-2">
                  <label className="form-label">Address Line 2 (Landmark, Area - Optional)</label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="e.g. Near Billupalam Mosque"
                    className="form-input"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Kannur"
                    className="form-input"
                    required
                  />
                </div>

                {/* State */}
                <div>
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Kerala"
                    className="form-input"
                    required
                  />
                </div>

              </div>
            </div>

            {/* Payment Options */}
            <div className="glass-card p-6 bg-dark-100 border border-white/5">
              <h3 className="font-display font-black text-xl text-white mb-6 flex items-center gap-2">
                <FiCreditCard className="text-orange-500" /> Choose Payment Option
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === method.value
                        ? "border-orange-500 bg-orange-500/5 text-white"
                        : "border-white/5 bg-dark-200 text-slate-400 hover:text-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      className="accent-orange-500"
                    />
                    <div>
                      <p className="text-sm font-semibold">{method.label}</p>
                      {method.value === "COD" && (
                        <p className="text-[10px] text-slate-500 mt-0.5">Pay in cash upon doorstep delivery</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Breakdown */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 bg-dark-100 border border-white/5">
              <h3 className="font-display font-black text-lg text-white mb-6">Confirm Items</h3>

              <div className="divide-y divide-white/5 space-y-3 mb-6 max-h-[220px] overflow-y-auto pr-1">
                {cart.items && cart.items.map((item) => (
                  <div key={item._id} className="flex justify-between items-center py-3 text-xs gap-3">
                    <span className="text-slate-300 font-semibold line-clamp-1 flex-1">{item.name}</span>
                    <span className="text-slate-500 flex-shrink-0">Qty: {item.quantity}</span>
                    <span className="text-slate-100 font-bold flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-xs border-t border-white/5 pt-4">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(itemsPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>18% GST</span>
                  <span>{formatPrice(taxPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping Cost</span>
                  <span>{shippingPrice === 0 ? "FREE" : formatPrice(shippingPrice)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-4">
                <span className="font-bold text-white text-sm">Net Total Price</span>
                <span className="font-display font-black text-xl text-orange-400">{formatPrice(finalPrice)}</span>
              </div>

              <div className="mt-6">
                <Button
                  type="submit"
                  variant="accent"
                  fullWidth
                  loading={loading}
                  className="flex justify-center items-center gap-1.5"
                >
                  <FiCheckCircle size={18} /> Place Order
                </Button>
              </div>
            </div>

            <div className="glass-card p-5 bg-dark-100 border border-white/5 flex gap-3 text-xs text-slate-400">
              <FiInfo className="text-orange-500 mt-0.5 flex-shrink-0" size={16} />
              <span className="leading-relaxed">
                By placing this order, you agree to receive order progress updates and invoice receipts on your listed mobile number.
              </span>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Checkout;
