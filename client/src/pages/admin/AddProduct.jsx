// pages/admin/AddProduct.jsx
// WHY: Form interface for the admin to add new products.

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiPlus, FiTag, FiDollarSign, FiInfo } from "react-icons/fi";
import api from "../../services/api";
import Button from "../../components/common/Button";
import { CATEGORIES } from "../../utils/constants";
import { compressAndConvertToBase64 } from "../../utils/imageUpload";
import toast from "react-hot-toast";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName]               = useState("");
  const [brand, setBrand]             = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice]             = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [category, setCategory]       = useState("Spare Parts");
  const [stock, setStock]             = useState("");
  const [imageUrl, setImageUrl]       = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !price || !category || !stock || !imageUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/admin/products", {
        name,
        brand,
        description,
        price: Number(price),
        discountedPrice: discountedPrice ? Number(discountedPrice) : 0,
        category,
        stock: Number(stock),
        images: [imageUrl],
      });
      toast.success("Product created successfully");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // Filter out "All" category option
  const validCategories = CATEGORIES.filter(c => c !== "All");

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100 animate-fade-in">
      <div className="container-custom py-12 max-w-3xl">
        <Link to="/admin/products" className="text-xs font-semibold text-orange-400 hover:text-orange-300">
          ← Back to Products
        </Link>
        <h1 className="section-title mt-2 mb-8">Add New Product</h1>

        <form onSubmit={handleSubmit} className="glass-card p-8 bg-dark-100 border border-white/5 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Brembo High Performance Brake Pads"
                className="form-input"
                required
              />
            </div>

            {/* Brand */}
            <div>
              <label className="form-label">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Brembo"
                className="form-input"
              />
            </div>

            {/* Category */}
            <div>
              <label className="form-label">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-dark-200 text-white w-full px-3 py-2 rounded-xl border border-white/5 outline-none focus:border-orange-500"
                required
              >
                {validCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="form-label">Retail Price (₹) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="3450"
                className="form-input"
                required
              />
            </div>

            {/* Discounted Price */}
            <div>
              <label className="form-label">Discounted Price (₹)</label>
              <input
                type="number"
                value={discountedPrice}
                onChange={(e) => setDiscountedPrice(e.target.value)}
                placeholder="2990"
                className="form-input"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="form-label">Stock Count *</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                className="form-input"
                required
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="form-label">Image URL Link *</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="form-input"
                  required
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

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="form-label">Product Description *</label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed description of product quality, dimensions, specifications..."
                className="form-input resize-none"
                required
              />
            </div>

          </div>

          <Button
              type="submit"
              variant="accent"
              loading={loading}
              fullWidth
              className="flex justify-center items-center gap-1.5"
            >
              <FiPlus size={16} /> Save Product to Catalog
            </Button>
          </form>

      </div>
    </div>
  );
};

export default AddProduct;
