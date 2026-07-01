// pages/admin/Dashboard.jsx
// WHY: Main admin dashboard showing revenue stats, users, bookings, and orders.

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiTrendingUp, FiUsers, FiPackage, FiTool, FiMessageCircle, FiCheck, FiX, FiCheckCircle
} from "react-icons/fi";
import api from "../../services/api";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { formatPrice, formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/bookings"),
      ]);
      setStats(statsRes.data.data);
      setBookings(bookingsRes.data.data.bookings || []);
    } catch (err) {
      console.error("Error loading admin data:", err);
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}`, { status });
      toast.success(`Booking status changed to ${status}`);
      fetchDashboardData(); // Refresh list
    } catch (err) {
      toast.error("Could not update booking status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-300 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const overview = stats?.overview || { totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 };
  const recentOrders = stats?.recentOrders || [];
  const lowStock = stats?.lowStockProducts || [];

  const statusColors = {
    Pending: "warning",
    Confirmed: "primary",
    Completed: "success",
    Cancelled: "danger",
  };

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100 animate-fade-in">
      <div className="container-custom">
        
        {/* Title */}
        <div className="mb-8">
          <span className="text-sm font-bold text-orange-400 uppercase tracking-widest font-display">Control Panel</span>
          <h1 className="section-title mt-2">Torque Admin Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Manage workshop bookings, store products, and order shipments</p>
        </div>

        {/* ── METRICS GRID ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          {/* Revenue */}
          <div className="glass-card p-6 bg-dark-100 border border-white/5">
            <div className="flex justify-between items-center gap-4 text-orange-400 mb-4">
              <FiTrendingUp size={24} />
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Earnings</span>
            </div>
            <span className="text-slate-400 text-xs block">Total Revenue</span>
            <span className="font-display font-black text-2xl text-white mt-1 block">
              {formatPrice(overview.totalRevenue)}
            </span>
          </div>

          {/* Users */}
          <div className="glass-card p-6 bg-dark-100 border border-white/5">
            <div className="flex justify-between items-center gap-4 text-orange-400 mb-4">
              <FiUsers size={24} />
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Accounts</span>
            </div>
            <span className="text-slate-400 text-xs block">Total Clients</span>
            <span className="font-display font-black text-2xl text-white mt-1 block">
              {overview.totalUsers} registered
            </span>
          </div>

          {/* Products */}
          <div className="glass-card p-6 bg-dark-100 border border-white/5">
            <div className="flex justify-between items-center gap-4 text-orange-400 mb-4">
              <FiPackage size={24} />
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Inventory</span>
            </div>
            <span className="text-slate-400 text-xs block">Store Products</span>
            <span className="font-display font-black text-2xl text-white mt-1 block">
              {overview.totalProducts} items
            </span>
          </div>

          {/* Service requests */}
          <div className="glass-card p-6 bg-dark-100 border border-white/5">
            <div className="flex justify-between items-center gap-4 text-orange-400 mb-4">
              <FiTool size={24} />
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Services</span>
            </div>
            <span className="text-slate-400 text-xs block">Garage Bookings</span>
            <span className="font-display font-black text-2xl text-white mt-1 block">
              {bookings.length} slots
            </span>
          </div>

        </div>

        {/* ── LAYOUT SHELL ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* Tab 1: Workshop Bookings Manager */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-lg text-white">Workshop Appointments</h3>
              <span className="text-xs text-slate-500 font-semibold">{bookings.filter(b => b.status === "Pending").length} pending slots</span>
            </div>

            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((book) => (
                  <div key={book._id} className="glass-card p-5 bg-dark-100 border border-white/5 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-white">{book.customerName}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{book.phone} • Bike: {book.bikeModel}</p>
                        <p className="text-[11px] text-orange-400 font-semibold mt-1">Requested slot: {formatDate(book.preferredDate)}</p>
                      </div>

                      <Badge color={statusColors[book.status]}>{book.status}</Badge>
                    </div>

                    {book.notes && (
                      <p className="text-[11px] text-slate-400 bg-dark-200 p-2.5 rounded-lg border border-white/5">
                        {book.notes}
                      </p>
                    )}

                    {/* Admin Actions */}
                    {book.status === "Pending" && (
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => handleBookingStatus(book._id, "Confirmed")}
                          variant="accent"
                          size="sm"
                          className="flex items-center gap-1.5"
                        >
                          <FiCheck size={14} /> Confirm Slot
                        </Button>
                        <Button
                          onClick={() => handleBookingStatus(book._id, "Cancelled")}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1.5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                        >
                          <FiX size={14} /> Cancel
                        </Button>
                      </div>
                    )}

                    {book.status === "Confirmed" && (
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleBookingStatus(book._id, "Completed")}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <FiCheckCircle size={14} /> Mark Completed
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center text-xs text-slate-500 border border-white/5">
                No service bookings requested yet.
              </div>
            )}
          </div>

          {/* Tab 2: Inventory & Store alerts */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="font-display font-black text-lg text-white">Low Stock Alerts</h3>
            
            {lowStock.length > 0 ? (
              <div className="space-y-4">
                {lowStock.map((prod) => (
                  <div key={prod._id} className="glass-card p-4 bg-dark-100 border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-200 border border-white/5 flex-shrink-0">
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white line-clamp-1">{prod.name}</h4>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{prod.category}</span>
                      </div>
                    </div>

                    <span className="text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg flex-shrink-0">
                      {prod.stock} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center text-xs text-slate-500 border border-white/5">
                All inventory is fully stocked (above 5 units)!
              </div>
            )}

            {/* Quick Links */}
            <div className="glass-card p-5 bg-dark-100 border border-white/5 space-y-3">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-2">Management Links</h4>
              <Link to="/admin/products" className="block text-xs font-semibold text-orange-400 hover:underline">→ Manage Store Products</Link>
              <Link to="/admin/orders" className="block text-xs font-semibold text-orange-400 hover:underline">→ View Shop Orders</Link>
              <Link to="/admin/users" className="block text-xs font-semibold text-orange-400 hover:underline">→ Manage User Roles</Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
