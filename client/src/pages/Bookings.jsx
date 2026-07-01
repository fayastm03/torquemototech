// pages/Bookings.jsx
// WHY: Dashboard to schedule motorcycle service appointments and monitor status.

import React, { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiTool, FiUser, FiPhone, FiFileText, FiActivity, FiMessageCircle } from "react-icons/fi";
import { createBooking, getMyBookings } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import Badge from "../components/common/Badge";
import { formatDate } from "../utils/helpers";
import toast from "react-hot-toast";

const Bookings = () => {
  const { user } = useAuth();
  
  // Navigation tabs (if logged in)
  const [activeTab, setActiveTab] = useState("book"); // 'book' or 'my-bookings'
  const [myBookings, setMyBookings] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form inputs
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [bikeModel, setBikeModel] = useState("");
  const [serviceType, setServiceType] = useState("General Service");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");

  const serviceOptions = [
    "General Service",
    "Engine Repair",
    "Oil Change",
    "Custom Modifications",
    "Other Repair",
  ];

  const statusColors = {
    Pending: "warning",
    Confirmed: "primary",
    Completed: "success",
    Cancelled: "danger",
  };

  const fetchBookingHistory = async () => {
    if (!user) return;
    try {
      setLoadingHistory(true);
      const data = await getMyBookings();
      setMyBookings(data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "my-bookings") {
      fetchBookingHistory();
    }
  }, [activeTab, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !phone || !bikeModel || !serviceType || !preferredDate) {
      return toast.error("Please fill in all required fields");
    }

    try {
      setSubmitting(true);
      const bookingData = {
        customerName,
        phone,
        bikeModel,
        serviceType,
        preferredDate,
        notes,
      };

      await createBooking(bookingData);
      toast.success("Service booking requested successfully! We will contact you soon.");
      
      // Reset form
      setBikeModel("");
      setPhone("");
      setNotes("");
      setPreferredDate("");

      if (user) {
        setActiveTab("my-bookings");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error scheduling service appointment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100">
      <div className="container-custom">
        
        {/* Title */}
        <div className="mb-8">
          <span className="text-sm font-bold text-orange-400 uppercase tracking-widest font-display">Workshop</span>
          <h1 className="section-title mt-2">Garage Service Scheduling</h1>
          <p className="text-xs text-slate-500 mt-1">Book maintenance, custom modifications or engine tuneups in Kannur, Kerala</p>
        </div>

        {/* Tab Controls (Only for logged-in users) */}
        {user && (
          <div className="flex border-b border-white/5 mb-8">
            <button
              onClick={() => setActiveTab("book")}
              className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
                activeTab === "book"
                  ? "border-orange-500 text-white"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Book Appointment
            </button>
            <button
              onClick={() => setActiveTab("my-bookings")}
              className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
                activeTab === "my-bookings"
                  ? "border-orange-500 text-white"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              My Bookings
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* TAB 1: Booking Form (or left panel) */}
          {activeTab === "book" ? (
            <>
              <div className="lg:col-span-2">
                <div className="glass-card p-6 md:p-8 bg-dark-100 border border-white/5">
                  <h3 className="font-display font-black text-xl text-white mb-6 flex items-center gap-2">
                    <FiCalendar className="text-orange-500" /> Schedule Service Appointment
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Customer Name */}
                      <div>
                        <label className="form-label flex items-center gap-2">
                          <FiUser size={14} /> Full Name *
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Your Name"
                          className="form-input"
                          required
                        />
                      </div>

                      {/* Contact Phone */}
                      <div>
                        <label className="form-label flex items-center gap-2">
                          <FiPhone size={14} /> Contact Number *
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone number"
                          className="form-input"
                          required
                        />
                      </div>

                      {/* Bike Model */}
                      <div>
                        <label className="form-label flex items-center gap-2">
                          <FiActivity size={14} /> Motorcycle Brand & Model *
                        </label>
                        <input
                          type="text"
                          value={bikeModel}
                          onChange={(e) => setBikeModel(e.target.value)}
                          placeholder="e.g. KTM Duke 200, Royal Enfield 350"
                          className="form-input"
                          required
                        />
                      </div>

                      {/* Service Type */}
                      <div>
                        <label className="form-label flex items-center gap-2">
                          <FiTool size={14} /> Service Category *
                        </label>
                        <select
                          value={serviceType}
                          onChange={(e) => setServiceType(e.target.value)}
                          className="form-input"
                          required
                        >
                          {serviceOptions.map((opt) => (
                            <option key={opt} value={opt} className="bg-dark-100 text-white">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Preferred Date */}
                      <div className="md:col-span-2">
                        <label className="form-label flex items-center gap-2">
                          <FiCalendar size={14} /> Preferred Service Appointment Date *
                        </label>
                        <input
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="form-input"
                          required
                          min={new Date().toISOString().split("T")[0]} // Disable past dates
                        />
                      </div>

                      {/* Notes / Descriptions */}
                      <div className="md:col-span-2">
                        <label className="form-label flex items-center gap-2">
                          <FiFileText size={14} /> Specific Problems / Custom Requirements
                        </label>
                        <textarea
                          rows="4"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Describe your motorcycle's issues or any parts upgrades needed (e.g. chain adjust, oil filter, custom exhaust fitment)..."
                          className="form-input resize-none"
                        />
                      </div>

                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        variant="accent"
                        loading={submitting}
                        fullWidth
                      >
                        Request Garage Appointment
                      </Button>
                    </div>

                  </form>
                </div>
              </div>

              {/* Sidebar Guide */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-6 bg-dark-100 border border-white/5">
                  <h4 className="font-display font-black text-lg text-white mb-4">Garage Booking Guide</h4>
                  <ul className="space-y-4 text-slate-400 text-xs leading-relaxed">
                    <li className="flex gap-2.5">
                      <span className="w-5 h-5 rounded bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold flex-shrink-0">1</span>
                      <span>Request an appointment date. We accommodate requests on a first-come first-served basis.</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="w-5 h-5 rounded bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold flex-shrink-0">2</span>
                      <span>Our team will call or message your contact number within 2 hours to confirm your garage slot.</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="w-5 h-5 rounded bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold flex-shrink-0">3</span>
                      <span>Bring your motorcycle to our Koyyode workshop, or request pick-up if within 5km.</span>
                    </li>
                  </ul>
                </div>

                <div className="glass-card p-6 bg-dark-100 border border-white/5 text-center">
                  <h4 className="font-bold text-white text-sm mb-2">Need Urgent Repairs?</h4>
                  <p className="text-xs text-slate-500 mb-4">Call our hotline directly for immediate emergency breakdown service in Kannur.</p>
                  <a href="tel:+917994884603">
                    <Button variant="outline" fullWidth size="sm">
                      Call Garage Support
                    </Button>
                  </a>
                </div>
              </div>
            </>
          ) : (
            // TAB 2: Bookings History
            <div className="lg:col-span-3">
              {loadingHistory ? (
                <div className="flex justify-center items-center py-24">
                  <Spinner size="lg" />
                </div>
              ) : myBookings.length > 0 ? (
                <div className="space-y-4">
                  {myBookings.map((book) => (
                    <div
                      key={book._id}
                      className="glass-card p-6 bg-dark-100 border border-white/5 flex flex-wrap items-center justify-between gap-6"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 flex-shrink-0">
                          <FiTool size={22} />
                        </div>
                        <div>
                          <h4 className="font-display font-black text-lg text-white">
                            {book.serviceType}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Vehicle: <span className="text-slate-200 font-semibold">{book.bikeModel}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <FiCalendar size={12} /> Appointment: {formatDate(book.preferredDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-xs text-slate-500">Status</span>
                          <div className="mt-1">
                            <Badge color={statusColors[book.status]}>
                              {book.status}
                            </Badge>
                          </div>
                        </div>

                        {book.status === "Pending" && (
                          <a
                            href={`https://wa.me/917994884603?text=Hi%20Torque%20MotoTech%2C%20inquiring%20about%20my%20service%20booking%20for%20the%20${encodeURIComponent(book.bikeModel)}%20on%20${formatDate(book.preferredDate)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <FiMessageCircle /> Speed Up
                            </Button>
                          </a>
                        )}
                      </div>

                      {book.notes && (
                        <div className="w-full border-t border-white/5 pt-4 mt-2">
                          <span className="text-xs text-slate-500 block mb-1">Your notes:</span>
                          <p className="text-xs text-slate-400 bg-dark-200 p-3 rounded-lg border border-white/5">
                            {book.notes}
                          </p>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-12 text-center bg-dark-100 border border-white/5 text-slate-500">
                  <p className="text-lg font-bold mb-2">No active service appointments found</p>
                  <p className="text-sm">You haven't scheduled any service slots yet.</p>
                  <Button onClick={() => setActiveTab("book")} variant="accent" className="mt-6">
                    Schedule Your First Service Slot
                  </Button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Bookings;
