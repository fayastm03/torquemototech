// pages/Shop.jsx
// WHY: The main product catalog store page. Enables filtering, sorting, searching, and paging through motorcycle components and accessories.

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiFilter, FiSliders, FiGrid, FiList } from "react-icons/fi";
import { getProducts, getCategories } from "../services/productService";
import ProductCard from "../components/product/ProductCard";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import { CATEGORIES, SORT_OPTIONS } from "../utils/constants";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(CATEGORIES);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProducts: 0 });

  // Get filter values from URL search parameters (sync with browser back/forward)
  const searchQuery = searchParams.get("search") || "";
  const categoryQuery = searchParams.get("category") || "All";
  const sortQuery = searchParams.get("sort") || "newest";
  const minPriceQuery = searchParams.get("minPrice") || "";
  const maxPriceQuery = searchParams.get("maxPrice") || "";
  const pageQuery = searchParams.get("page") || "1";

  // Local state for price inputs (so we only trigger search on click/submit)
  const [minPrice, setMinPrice] = useState(minPriceQuery);
  const [maxPrice, setMaxPrice] = useState(maxPriceQuery);

  useEffect(() => {
    // Keep local inputs in sync when URL changes
    setMinPrice(minPriceQuery);
    setMaxPrice(maxPriceQuery);
  }, [minPriceQuery, maxPriceQuery]);

  // Fetch products whenever search params change
  useEffect(() => {
    const fetchStoreProducts = async () => {
      try {
        setLoading(true);
        const params = {
          search: searchQuery,
          category: categoryQuery === "All" ? "" : categoryQuery,
          sort: sortQuery,
          minPrice: minPriceQuery,
          maxPrice: maxPriceQuery,
          page: pageQuery,
          limit: 12,
        };
        const data = await getProducts(params);
        setProducts(data.products || []);
        setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalProducts: 0 });
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreProducts();
  }, [searchQuery, categoryQuery, sortQuery, minPriceQuery, maxPriceQuery, pageQuery]);

  // Fetch unique categories on load
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const uniqueCats = await getCategories();
        if (uniqueCats && uniqueCats.length > 0) {
          setCategories(["All", ...uniqueCats]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCats();
  }, []);

  // Helper to update search params
  const updateQuery = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams, page: "1" }; // Reset to page 1 on filter update
    
    // Remove empty parameters
    Object.keys(merged).forEach((key) => {
      if (merged[key] === "" || merged[key] === null || merged[key] === undefined) {
        delete merged[key];
      }
    });

    setSearchParams(merged);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const searchVal = fd.get("searchVal").toString().trim();
    updateQuery({ search: searchVal });
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    updateQuery({ minPrice, maxPrice });
  };

  const handleClearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100">
      <div className="container-custom">
        
        {/* Store Title */}
        <div className="mb-8">
          <span className="text-sm font-bold text-orange-400 uppercase tracking-widest">Torque Pro Store</span>
          <h1 className="section-title mt-2">Accessories, Spares & Gear</h1>
          <p className="text-xs text-slate-500 mt-1">Found {pagination.totalProducts} premium parts</p>
        </div>

        {/* Layout Shell */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* ── SIDEBAR FILTERS (DESKTOP) ────────────────────────────────── */}
          <aside className="lg:col-span-1 space-y-6">
            
            {/* Search Box */}
            <div className="glass-card p-5 bg-dark-100 border border-white/5">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                <FiSearch size={16} /> Search Product
              </h3>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  name="searchVal"
                  defaultValue={searchQuery}
                  placeholder="Brake pads, helmet..."
                  className="form-input pr-10 py-2.5"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  <FiSearch size={16} />
                </button>
              </form>
            </div>

            {/* Categories */}
            <div className="glass-card p-5 bg-dark-100 border border-white/5">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                <FiFilter size={16} /> Categories
              </h3>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateQuery({ category: cat })}
                    className={`text-left text-sm px-3 py-2 rounded-lg transition-all ${
                      categoryQuery === cat
                        ? "bg-orange-500/10 text-orange-400 font-bold border border-orange-500/20"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="glass-card p-5 bg-dark-100 border border-white/5">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                <FiSliders size={16} /> Price Range (₹)
              </h3>
              <form onSubmit={handlePriceApply} className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="form-input text-center py-2 px-1"
                  />
                  <span className="text-slate-600">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="form-input text-center py-2 px-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" variant="accent" size="sm" className="flex-1">
                    Apply
                  </Button>
                  <Button onClick={handleClearFilters} variant="ghost" size="sm" className="flex-1">
                    Reset
                  </Button>
                </div>
              </form>
            </div>

          </aside>

          {/* ── PRODUCTS MAIN CONTENT ────────────────────────────────────── */}
          <main className="lg:col-span-3">
            
            {/* Top Toolbar */}
            <div className="glass-card p-4 mb-6 bg-dark-100 border border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Sort By</span>
                <select
                  value={sortQuery}
                  onChange={(e) => updateQuery({ sort: e.target.value })}
                  className="bg-dark-200 text-sm text-white px-3 py-2 rounded-xl border border-white/5 outline-none focus:border-orange-500"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset shortcut */}
              {(searchQuery || categoryQuery !== "All" || minPriceQuery || maxPriceQuery) && (
                <button onClick={handleClearFilters} className="text-xs font-semibold text-orange-400 hover:text-orange-300">
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <Spinner size="lg" />
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <Button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      variant="ghost"
                      size="sm"
                    >
                      Previous
                    </Button>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-9 h-9 rounded-lg font-bold text-sm transition-all ${
                          pagination.currentPage === i + 1
                            ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                            : "bg-dark-100 hover:bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <Button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      variant="ghost"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card p-12 text-center bg-dark-100 border border-white/5 text-slate-500">
                <p className="text-lg font-bold mb-2">No matching products found</p>
                <p className="text-sm">Try modifying your filters, search term, or price range.</p>
                <Button onClick={handleClearFilters} variant="accent" className="mt-6">
                  Reset Store Filters
                </Button>
              </div>
            )}

          </main>

        </div>
      </div>
    </div>
  );
};

export default Shop;
