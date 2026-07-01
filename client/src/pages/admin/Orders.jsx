// pages/admin/Orders.jsx
// WHY: Table list of all orders for the admin.

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiCheckCircle } from "react-icons/fi";
import api from "../../services/api";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { formatPrice, formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders");
      setOrders(data.data.orders || []);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Order status updated!");
      fetchOrders(); // Refresh table
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not change status");
    }
  };

  const statusColors = {
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
          <Link to="/admin" className="text-xs font-semibold text-orange-400 hover:text-orange-300">
            ← Back to Dashboard
          </Link>
          <h1 className="section-title mt-2">Manage Store Orders</h1>
          <p className="text-xs text-slate-500 mt-1">Review shop invoices and process delivery statuses</p>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Spinner size="lg" />
          </div>
        ) : orders.length > 0 ? (
          <div className="glass-card bg-dark-100 border border-white/5 overflow-x-auto rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-dark-200/50 text-slate-400 uppercase tracking-widest font-semibold">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-200">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-200 block">{order.user?.name}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">{order.user?.email}</span>
                    </td>
                    <td className="p-4 text-slate-400">{formatDate(order.createdAt)}</td>
                    <td className="p-4 font-bold text-slate-200">{formatPrice(order.totalPrice)}</td>
                    <td className="p-4">
                      <Badge color={statusColors[order.status]}>{order.status.toUpperCase()}</Badge>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      
                      {/* Status quick select */}
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleStatusChange(order._id, "processing")}
                          className="text-xs text-orange-400 hover:text-orange-300 font-bold border border-orange-500/20 px-2.5 py-1 rounded-lg bg-orange-500/5"
                        >
                          Process
                        </button>
                      )}

                      {order.status === "processing" && (
                        <button
                          onClick={() => handleStatusChange(order._id, "shipped")}
                          className="text-xs text-blue-400 hover:text-blue-300 font-bold border border-blue-500/20 px-2.5 py-1 rounded-lg bg-blue-500/5"
                        >
                          Ship
                        </button>
                      )}

                      {order.status === "shipped" && (
                        <button
                          onClick={() => handleStatusChange(order._id, "delivered")}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold border border-emerald-500/20 px-2.5 py-1 rounded-lg bg-emerald-500/5"
                        >
                          Deliver
                        </button>
                      )}

                      <Link to={`/orders/${order._id}`}>
                        <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors" title="View details">
                          <FiEye size={14} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass-card p-12 text-center text-slate-500 border border-white/5">
            No orders placed yet on the store.
          </div>
        )}

      </div>
    </div>
  );
};

export default Orders;
