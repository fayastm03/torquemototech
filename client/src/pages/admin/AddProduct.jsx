// pages/admin/AddProduct.jsx
// WHY: Form interface for the admin to add new products.

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiPlus, FiTag, FiDollarSign, FiInfo } from "react-icons/fi";
import api from "../../services/api";
import Button from "../../components/common/Button";
import { CATEGORIES } from "../../utils/constants";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !brand || !description || !price || !stock || !imageUrl) {
      return toast.error("Please fill in all required fields");
    }

    try {
      setLoading(true);
      const productPayload = {
        name,
        brand,
        description,
        price: Number(price),
        discountedPrice: discountedPrice ? Number(discountedPrice) : 0,
        category,
        stock: Number(stock),
        images: [imageUrl.trim()],
      };

      await api.post("/products", productPayload);
      toast.success("Product added successfully! 🎉");
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
      <div className="container-custom max-w-2xl">
        
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin/products" className="text-xs font-semibold text-orange-400 hover:text-orange-300">
            ← Back to Inventory
          </Link>
          <h1 className="section-title mt-2">Add New Product</h1>
          <p className="text-xs text-slate-500 mt-1">Specify catalog details, inventory counts, and price rates</p>
        </div>

        {/* Form panel */}
        <div className="glass-card p-6 md:p-8 bg-dark-100 border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MT Hummer Solid Street Helmet"
                  className="form-input"
                  required
                />
              </div>

              {/* Brand */}
              <div>
                <label className="form-label">Brand Name *</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. MT Helmets"
                  className="form-input"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="form-label">Store Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input"
                  required
                >
                  {validCategories.map(cat => (
                    <option key={cat} value={cat} className="bg-dark-100">{cat}</option>
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
                  placeholder="4999"
                  className="form-input"
                  required
                />
              </div>

              {/* Offer price */}
              <div>
                <label className="form-label">Discounted/Sale Price (₹)</label>
                <input
                  type="number"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(e.target.value)}
                  placeholder="4499"
                  className="form-input"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="form-label">Initial Stock Count *</label>
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
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="form-input"
                  required
                />
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
    </div>
  );
};

export default AddProduct;
