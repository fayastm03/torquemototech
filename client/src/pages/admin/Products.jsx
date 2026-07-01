// pages/admin/Products.jsx
// WHY: Table list of all products in inventory for the admin.

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import api from "../../services/api";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { formatPrice } from "../../utils/helpers";
import toast from "react-hot-toast";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = search.trim() ? { search: search.trim() } : {};
      const { data } = await api.get("/products", { params });
      setProducts(data.data.products || []);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted successfully");
      fetchProducts(); // Reload table
    } catch (err) {
      toast.error("Could not delete product");
    }
  };

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100 animate-fade-in">
      <div className="container-custom">
        
        {/* Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Link to="/admin" className="text-xs font-semibold text-orange-400 hover:text-orange-300">
              ← Back to Dashboard
            </Link>
            <h1 className="section-title mt-2">Manage Store Products</h1>
            <p className="text-xs text-slate-500 mt-1">Catalog overview and item details</p>
          </div>

          <Link to="/admin/products/add">
            <Button variant="accent" className="flex items-center gap-1.5">
              <FiPlus size={16} /> Add Product
            </Button>
          </Link>
        </div>

        {/* Toolbar */}
        <div className="glass-card p-4 mb-6 bg-dark-100 border border-white/5 flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input py-2"
          />
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Spinner size="lg" />
          </div>
        ) : products.length > 0 ? (
          <div className="glass-card bg-dark-100 border border-white/5 overflow-x-auto rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-dark-200/50 text-slate-400 uppercase tracking-widest font-semibold">
                  <th className="p-4">Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-200 border border-white/5 flex-shrink-0">
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 block line-clamp-1">{prod.name}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">{prod.brand}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{prod.category}</td>
                    <td className="p-4 font-bold text-slate-200">{formatPrice(prod.price)}</td>
                    <td className="p-4">
                      <span className={`font-semibold ${prod.stock <= 5 ? "text-red-400" : "text-slate-400"}`}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link to={`/admin/products/edit/${prod._id}`}>
                        <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                          <FiEdit2 size={14} />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(prod._id)}
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
            No products found matching your search.
          </div>
        )}

      </div>
    </div>
  );
};

export default Products;
