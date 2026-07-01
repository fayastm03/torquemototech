// pages/OrderDetail.jsx
// WHY: Detailed single order view. Displays delivery progress tracker, shipment items, and billing details.

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiPackage, FiCalendar, FiMapPin, FiCreditCard, FiClock, FiMessageCircle } from "react-icons/fi";
import api from "../services/api";
import Spinner from "../components/common/Spinner";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { formatPrice, formatDate } from "../utils/helpers";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.data.order);
      } catch (err) {
        console.error("Error fetching order details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-300 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-wrapper bg-dark-300 text-center py-24 text-slate-500">
        <p className="text-lg font-bold">Order not found</p>
        <Link to="/orders" className="text-orange-400 mt-4 inline-block hover:underline">Back to History</Link>
      </div>
    );
  }

  const statusMap = {
    pending: "warning",
    processing: "primary",
    shipped: "accent",
    delivered: "success",
    cancelled: "danger",
  };

  const steps = ["pending", "processing", "shipped", "delivered"];
  const currentStepIndex = steps.indexOf(order.status);

  // WhatsApp support link
  const supportLink = `https://wa.me/917994884603?text=Hi%20Torque%20MotoTech%2C%20inquiring%20about%20order%20status%20for%20Order%20ID%3A%20%23${order._id.toUpperCase()}`;

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100 animate-fade-in">
      <div className="container-custom max-w-4xl">
        
        {/* Header toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Link to="/orders" className="text-xs font-semibold text-orange-400 hover:text-orange-300">
              ← Back to History
            </Link>
            <h1 className="section-title mt-2">Order Details</h1>
            <p className="text-xs text-slate-500 mt-1">ID: #{order._id.toUpperCase()} • Placed on {formatDate(order.createdAt)}</p>
          </div>

          <Badge color={statusMap[order.status]} className="text-sm px-4 py-1.5 uppercase">
            {order.status}
          </Badge>
        </div>

        {/* ── STATUS PROGRESS BAR ───────────────────────────────────────── */}
        {order.status !== "cancelled" && (
          <div className="glass-card p-6 mb-8 bg-dark-100 border border-white/5">
            <h3 className="font-bold text-white text-xs uppercase tracking-widest mb-6">Delivery Progress</h3>
            <div className="relative flex items-center justify-between">
              {/* Connector lines */}
              <div className="absolute left-0 right-0 h-0.5 bg-white/5 z-0" />
              <div
                className="absolute left-0 h-0.5 bg-orange-500 z-0 transition-all duration-500"
                style={{
                  width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                }}
              />

              {/* Step bubbles */}
              {steps.map((step, index) => {
                const active = index <= currentStepIndex;
                const activeColor = step === "delivered" ? "bg-emerald-500" : "bg-orange-500";
                return (
                  <div key={step} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                        active
                          ? `${activeColor} border-transparent text-black scale-110 shadow-lg`
                          : "bg-dark-200 border-white/10 text-slate-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className={`text-[10px] uppercase font-bold mt-2 tracking-wider ${active ? "text-slate-200" : "text-slate-500"}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Shipping Address */}
          <div className="glass-card p-6 bg-dark-100 border border-white/5">
            <h3 className="font-display font-black text-base text-white mb-4 flex items-center gap-2">
              <FiMapPin className="text-orange-500" /> Delivery Address
            </h3>
            <div className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
              <p className="font-bold text-slate-200 text-sm">{order.shippingAddress.fullName}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
              <p className="text-[10px] text-slate-500 mt-2">Country: {order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment Snapshot */}
          <div className="glass-card p-6 bg-dark-100 border border-white/5">
            <h3 className="font-display font-black text-base text-white mb-4 flex items-center gap-2">
              <FiCreditCard className="text-orange-500" /> Payment & Status
            </h3>
            <div className="text-xs text-slate-400 space-y-3">
              <div>
                <span className="text-slate-500 block mb-0.5">Method</span>
                <span className="font-semibold text-slate-200">{order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Payment Status</span>
                <Badge color={order.isPaid ? "success" : "warning"}>
                  {order.isPaid ? `PAID ON ${formatDate(order.paidAt)}` : "PENDING PAYMENT"}
                </Badge>
              </div>
              {order.isDelivered && (
                <div>
                  <span className="text-slate-500 block mb-0.5">Delivery Status</span>
                  <Badge color="success">
                    DELIVERED ON {formatDate(order.deliveredAt)}
                  </Badge>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Items List */}
        <div className="glass-card p-6 bg-dark-100 border border-white/5 mb-8">
          <h3 className="font-display font-black text-base text-white mb-4 flex items-center gap-2">
            <FiPackage className="text-orange-500" /> Ordered Items
          </h3>

          <div className="divide-y divide-white/5 space-y-4">
            {order.orderItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between gap-4 pt-4 first:pt-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-dark-200 flex-shrink-0 border border-white/5">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-200 line-clamp-1">{item.name}</h4>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Price: {formatPrice(item.price)}</span>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <span className="text-xs text-slate-400 font-semibold block">Qty: {item.quantity}</span>
                  <span className="text-xs text-slate-200 font-bold mt-1 block">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="border-t border-white/5 mt-6 pt-6 space-y-3 text-xs text-slate-400 max-w-sm ml-auto">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="text-slate-200 font-semibold">{formatPrice(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST Tax (18%)</span>
              <span className="text-slate-200 font-semibold">{formatPrice(order.taxPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping cost</span>
              <span className="text-slate-200 font-semibold">{order.shippingPrice === 0 ? "FREE" : formatPrice(order.shippingPrice)}</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-3 mt-3 text-sm font-bold text-white">
              <span>Total Price Paid</span>
              <span className="text-orange-400">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Quick WhatsApp Support Help */}
        <div className="glass-card p-6 bg-dark-100 border border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FiClock className="text-orange-500" size={24} />
            <div>
              <h4 className="font-bold text-white text-sm">Need help tracking or changing your order?</h4>
              <p className="text-xs text-slate-500 mt-0.5">Chat directly with Torque MotoTech staff support desk.</p>
            </div>
          </div>
          <a href={supportLink} target="_blank" rel="noopener noreferrer">
            <Button variant="accent" className="flex items-center gap-2">
              <FiMessageCircle size={18} /> Chat Order Support
            </Button>
          </a>
        </div>

      </div>
    </div>
  );
};

export default OrderDetail;
