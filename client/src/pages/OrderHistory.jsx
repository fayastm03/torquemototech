// pages/OrderHistory.jsx
// WHY: Displays user's order history with status tracking.

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPackage, FiCalendar, FiArrowRight, FiInfo } from "react-icons/fi";
import api from "../services/api";
import Spinner from "../components/common/Spinner";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { formatPrice, formatDate, getStatusColor } from "../utils/helpers";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/orders/my-orders");
        setOrders(data.data.orders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const statusMap = {
    pending: "warning",
    processing: "primary",
    shipped: "accent",
    delivered: "success",
    cancelled: "danger",
  };

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100 animate-fade-in">
      <div className="container-custom">
        
        {/* Title */}
        <div className="mb-8">
          <span className="text-sm font-bold text-orange-400 uppercase tracking-widest font-display">Account</span>
          <h1 className="section-title mt-2">Order History</h1>
          <p className="text-xs text-slate-500 mt-1">Monitor shipment statuses, print invoices, and view details</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Spinner size="lg" />
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="glass-card p-6 bg-dark-100 border border-white/5 flex flex-wrap items-center justify-between gap-6"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 flex-shrink-0">
                    <FiPackage size={22} />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm text-white">
                      Order ID: #{order._id.slice(-8).toUpperCase()}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Placed on: {formatDate(order.createdAt)}
                    </p>
                    <p className="text-xs text-slate-200 mt-1 font-bold">
                      Total price: {formatPrice(order.totalPrice)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Status</span>
                    <div className="mt-0.5">
                      <Badge color={statusMap[order.status]}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <Link to={`/orders/${order._id}`}>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      Details <FiArrowRight size={13} />
                    </Button>
                  </Link>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-16 text-center bg-dark-100 border border-white/5 text-slate-500">
            <div className="w-16 h-16 rounded-full bg-dark-200 flex items-center justify-center text-slate-400 mx-auto mb-6 border border-white/5">
              <FiPackage size={28} />
            </div>
            <p className="text-lg font-bold mb-2">No orders placed yet</p>
            <p className="text-sm">You haven't ordered any spare parts or riding gears yet.</p>
            <Button onClick={() => navigate("/shop")} variant="accent" className="mt-8">
              Explore Store
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderHistory;
