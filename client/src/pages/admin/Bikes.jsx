import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheck, FiX } from "react-icons/fi";
import { getBikes, createBikeListing, updateBikeListing, deleteBikeListing } from "../../services/bikeService";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { formatPrice } from "../../utils/helpers";
import { compressAndConvertToBase64 } from "../../utils/imageUpload";
import toast from "react-hot-toast";

const AdminBikes = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBikeId, setEditingBikeId] = useState(null);

  // Form Fields
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [kmDriven, setKmDriven] = useState(0);
  const [price, setPrice] = useState(0);
  const [condition, setCondition] = useState("Good");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("Available");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await compressAndConvertToBase64(file);
      setImageUrl(base64);
      toast.success("Local image uploaded and optimized successfully!");
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error("Could not process local image");
    }
  };


  const fetchBikes = async () => {
    try {
      setLoading(true);
      const params = search.trim() ? { search: search.trim() } : {};
      const data = await getBikes(params);
      setBikes(data || []);
    } catch (err) {
      console.error("Error loading bikes:", err);
      toast.error("Could not load used bikes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, [search]);

  const resetForm = () => {
    setEditingBikeId(null);
    setBrand("");
    setModel("");
    setYear(new Date().getFullYear());
    setKmDriven(0);
    setPrice(0);
    setCondition("Good");
    setDescription("");
    setImageUrl("");
    setStatus("Available");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (bike) => {
    setEditingBikeId(bike._id);
    setBrand(bike.brand);
    setModel(bike.model);
    setYear(bike.year);
    setKmDriven(bike.kmDriven);
    setPrice(bike.price);
    setCondition(bike.condition);
    setDescription(bike.description);
    setImageUrl(bike.images[0] || "");
    setStatus(bike.status);
    setIsModalOpen(true);
  };

  const handleStatusToggle = async (bike) => {
    const newStatus = bike.status === "Available" ? "Sold" : "Available";
    try {
      await updateBikeListing(bike._id, { status: newStatus });
      toast.success(`Bike marked as ${newStatus}`);
      fetchBikes();
    } catch (err) {
      console.error("Error updating bike status:", err);
      toast.error("Could not update status");
    }
  };

  const handleDelete = async (bikeId) => {
    if (!window.confirm("Are you sure you want to delete this bike listing?")) return;

    try {
      await deleteBikeListing(bikeId);
      toast.success("Bike listing deleted successfully");
      fetchBikes();
    } catch (err) {
      console.error("Error deleting bike:", err);
      toast.error("Could not delete listing");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!brand || !model || !year || !kmDriven || !price || !description || !imageUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    const bikeData = {
      brand,
      model,
      year: Number(year),
      kmDriven: Number(kmDriven),
      price: Number(price),
      condition,
      description,
      images: [imageUrl],
      status,
    };

    try {
      if (editingBikeId) {
        await updateBikeListing(editingBikeId, bikeData);
        toast.success("Bike listing updated successfully");
      } else {
        await createBikeListing(bikeData);
        toast.success("Used bike listing added successfully");
      }
      setIsModalOpen(false);
      resetForm();
      fetchBikes();
    } catch (err) {
      console.error("Error saving bike listing:", err);
      toast.error(err?.response?.data?.message || "Could not save bike listing");
    }
  };

  const conditions = ["Excellent", "Very Good", "Good", "Fair"];

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100 animate-fade-in">
      <div className="container-custom">

        {/* Title Block */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Link to="/admin" className="text-xs font-semibold text-orange-400 hover:text-orange-300">
              ← Back to Dashboard
            </Link>
            <h1 className="section-title mt-2">Manage Used Bikes</h1>
            <p className="text-xs text-slate-500 mt-1">Pre-owned showroom catalog and stock controller</p>
          </div>

          <Button onClick={handleOpenAddModal} variant="accent" className="flex items-center gap-1.5">
            <FiPlus size={16} /> Add Used Bike
          </Button>
        </div>

        {/* Search Bar */}
        <div className="glass-card p-4 mb-6 bg-dark-100 border border-white/5 flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Search by brand or model..."
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
        ) : bikes.length > 0 ? (
          <div className="glass-card bg-dark-100 border border-white/5 overflow-x-auto rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-dark-200/50 text-slate-400 uppercase tracking-widest font-semibold">
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Specs</th>
                  <th className="p-4">Condition</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bikes.map((bike) => (
                  <tr key={bike._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-200 border border-white/5 flex-shrink-0">
                        <img src={bike.images[0]} alt={`${bike.brand} ${bike.model}`} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 block line-clamp-1">{bike.brand} {bike.model}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">{bike.year} Model</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      {bike.kmDriven.toLocaleString()} KM driven
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {bike.condition}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-200">{formatPrice(bike.price)}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleStatusToggle(bike)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                          bike.status === "Available"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                        }`}
                      >
                        {bike.status === "Available" ? <FiCheck size={10} /> : <FiX size={10} />}
                        {bike.status}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(bike)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(bike._id)}
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
            No pre-owned motorcycle listings found.
          </div>
        )}

      </div>

      {/* ── Add / Edit Modal ────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-100 border border-white/5 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
            
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-display font-black text-xl text-white">
                {editingBikeId ? "Edit Used Bike Listing" : "Add New Used Bike"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yamaha"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. R15 V3"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Year *</label>
                  <input
                    type="number"
                    required
                    min="1980"
                    max={new Date().getFullYear() + 1}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">KM Driven *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={kmDriven}
                    onChange={(e) => setKmDriven(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Condition *</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="bg-dark-200 text-white w-full px-3 py-2 rounded-xl border border-white/5 outline-none focus:border-orange-500"
                  >
                    {conditions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 135000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-dark-200 text-white w-full px-3 py-2 rounded-xl border border-white/5 outline-none focus:border-orange-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Image URL *</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="https://example.com/bike.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="form-input"
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-dark-200 border border-white/10 hover:border-orange-500/30 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white transition-all duration-200">
                      <span>📁 Choose Local File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {imageUrl && (
                      <span className="text-[9px] text-slate-500 truncate max-w-[200px]">
                        Image selected ({imageUrl.startsWith("data:") ? "Local File" : "Web URL"})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Description *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Write details about ownership, exhaust modifications, mechanical condition, tyre wear, etc."
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
                  {editingBikeId ? "Save Changes" : "Create Listing"}
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBikes;
