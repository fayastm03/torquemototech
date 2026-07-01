// pages/admin/Rentals.jsx
// WHY: Table list of all rental vehicles (cars/bikes) for the admin. Includes a modal for Adding and Editing listings.

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheck, FiX } from "react-icons/fi";
import { getRentals, createRentalListing, updateRentalListing, deleteRentalListing } from "../../services/rentalService";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { formatPrice } from "../../utils/helpers";
import toast from "react-hot-toast";

const AdminRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRentalId, setEditingRentalId] = useState(null);

  // Form Fields
  const [name, setName] = useState("");
  const [type, setType] = useState("Bike"); // Bike, Car
  const [ratePerDay, setRatePerDay] = useState(0);
  const [transmission, setTransmission] = useState("Manual"); // Manual, Automatic
  const [fuelType, setFuelType] = useState("Petrol"); // Petrol, Diesel, EV
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [availability, setAvailability] = useState(true);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const params = search.trim() ? { search: search.trim() } : {};
      const data = await getRentals(params);
      setRentals(data || []);
    } catch (err) {
      console.error("Error loading rentals:", err);
      toast.error("Could not load rental listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [search]);

  const resetForm = () => {
    setEditingRentalId(null);
    setName("");
    setType("Bike");
    setRatePerDay(0);
    setTransmission("Manual");
    setFuelType("Petrol");
    setDescription("");
    setImageUrl("");
    setAvailability(true);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rental) => {
    setEditingRentalId(rental._id);
    setName(rental.name);
    setType(rental.type);
    setRatePerDay(rental.ratePerDay);
    setTransmission(rental.transmission);
    setFuelType(rental.fuelType);
    setDescription(rental.description);
    setImageUrl(rental.images[0] || "");
    setAvailability(rental.availability);
    setIsModalOpen(true);
  };

  const handleAvailabilityToggle = async (rental) => {
    const newAvailability = !rental.availability;
    try {
      await updateRentalListing(rental._id, { availability: newAvailability });
      toast.success(newAvailability ? "Vehicle marked as Available" : "Vehicle marked as Rented");
      fetchRentals();
    } catch (err) {
      console.error("Error updating availability:", err);
      toast.error("Could not update availability");
    }
  };

  const handleDelete = async (rentalId) => {
    if (!window.confirm("Are you sure you want to delete this rental vehicle?")) return;

    try {
      await deleteRentalListing(rentalId);
      toast.success("Rental vehicle deleted successfully");
      fetchRentals();
    } catch (err) {
      console.error("Error deleting rental:", err);
      toast.error("Could not delete listing");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !type || !ratePerDay || !description || !imageUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    const rentalData = {
      name,
      type,
      ratePerDay: Number(ratePerDay),
      transmission,
      fuelType,
      description,
      images: [imageUrl],
      availability,
    };

    try {
      if (editingRentalId) {
        await updateRentalListing(editingRentalId, rentalData);
        toast.success("Rental listing updated successfully");
      } else {
        await createRentalListing(rentalData);
        toast.success("Rental vehicle added successfully");
      }
      setIsModalOpen(false);
      resetForm();
      fetchRentals();
    } catch (err) {
      console.error("Error saving rental vehicle:", err);
      toast.error(err?.response?.data?.message || "Could not save rental listing");
    }
  };

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100 animate-fade-in">
      <div className="container-custom">

        {/* Title Block */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Link to="/admin" className="text-xs font-semibold text-orange-400 hover:text-orange-300">
              ← Back to Dashboard
            </Link>
            <h1 className="section-title mt-2">Manage Rental Fleet</h1>
            <p className="text-xs text-slate-500 mt-1">Car and bike rental catalog manager and availability tracker</p>
          </div>

          <Button onClick={handleOpenAddModal} variant="accent" className="flex items-center gap-1.5">
            <FiPlus size={16} /> Add Rental Vehicle
          </Button>
        </div>

        {/* Search Bar */}
        <div className="glass-card p-4 mb-6 bg-dark-100 border border-white/5 flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Search by vehicle name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input py-2"
          />
        </div>

        {/* Table List */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Spinner size="lg" />
          </div>
        ) : rentals.length > 0 ? (
          <div className="glass-card bg-dark-100 border border-white/5 overflow-x-auto rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-dark-200/50 text-slate-400 uppercase tracking-widest font-semibold">
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Specs</th>
                  <th className="p-4">Rate (Per Day)</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rentals.map((vehicle) => (
                  <tr key={vehicle._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-200 border border-white/5 flex-shrink-0">
                        <img src={vehicle.images[0]} alt={vehicle.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 block line-clamp-1">{vehicle.name}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">{vehicle.transmission}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-dark-200 text-slate-300 border border-white/5">
                        {vehicle.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {vehicle.fuelType}
                    </td>
                    <td className="p-4 font-bold text-slate-200">{formatPrice(vehicle.ratePerDay)} / Day</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleAvailabilityToggle(vehicle)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                          vehicle.availability
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                        }`}
                      >
                        {vehicle.availability ? <FiCheck size={10} /> : <FiX size={10} />}
                        {vehicle.availability ? "Available" : "Rented Out"}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(vehicle)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle._id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass-card p-12 text-center text-slate-500 border border-white/5">
            No rental vehicles found.
          </div>
        )}

      </div>

      {/* ── Add / Edit Modal ────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-100 border border-white/5 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">

            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-display font-black text-xl text-white">
                {editingRentalId ? "Edit Rental Vehicle" : "Add Rental Vehicle"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Vehicle Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Enfield Himalayan 450"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Vehicle Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="bg-dark-200 text-white w-full px-3 py-2 rounded-xl border border-white/5 outline-none focus:border-orange-500"
                  >
                    <option value="Bike">Bike</option>
                    <option value="Car">Car</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Rate Per Day (INR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 1200"
                    value={ratePerDay}
                    onChange={(e) => setRatePerDay(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Transmission *</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="bg-dark-200 text-white w-full px-3 py-2 rounded-xl border border-white/5 outline-none focus:border-orange-500"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Fuel Type *</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="bg-dark-200 text-white w-full px-3 py-2 rounded-xl border border-white/5 outline-none focus:border-orange-500"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="EV">EV</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Image URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="https://example.com/vehicle.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Availability</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value === "true")}
                    className="bg-dark-200 text-white w-full px-3 py-2 rounded-xl border border-white/5 outline-none focus:border-orange-500"
                  >
                    <option value="true">Available</option>
                    <option value="false">Rented Out</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Description *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe condition, safety gear provided, helmet options, security deposit, fuel rules, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input min-h-[80px] py-2"
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="accent">
                  {editingRentalId ? "Save Changes" : "Create Listing"}
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminRentals;
