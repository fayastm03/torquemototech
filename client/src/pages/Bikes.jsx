// pages/Bikes.jsx
// WHY: The Used Bikes catalog page. Showcases pre-owned vehicles with filtering and instant WhatsApp enquiry integration.

import React, { useState, useEffect } from "react";
import { FiSearch, FiSliders, FiMessageCircle, FiPlusCircle, FiCalendar, FiTrendingUp } from "react-icons/fi";
import { getBikes } from "../services/bikeService";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import { formatPrice } from "../utils/helpers";

const Bikes = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");

  const fetchBikesList = async () => {
    try {
      setLoading(true);
      const params = {};
      if (brandFilter) params.brand = brandFilter;
      if (conditionFilter) params.condition = conditionFilter;
      if (search.trim()) params.search = search.trim();
      
      const data = await getBikes(params);
      setBikes(data || []);
    } catch (err) {
      console.error("Error fetching bikes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikesList();
  }, [brandFilter, conditionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBikesList();
  };

  const handleResetFilters = () => {
    setSearch("");
    setBrandFilter("");
    setConditionFilter("");
  };

  // WhatsApp link generator
  // Pre-fills a message: "Hi Torque MotoTech, I am interested in the Yamaha R15 (2021 Model) priced at ₹1,35,000. Is it still available?"
  const getWhatsAppLink = (bike) => {
    const phone = "917994884603"; // Torque MotoTech contact phone
    const text = `Hi Torque MotoTech, I am interested in the ${bike.brand} ${bike.model} (${bike.year} Model, KM: ${bike.kmDriven.toLocaleString()}) priced at ${formatPrice(bike.price)}. Is it still available?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const brands = ["Yamaha", "KTM", "Royal Enfield", "Honda", "Suzuki", "Bajaj"];
  const conditions = ["Excellent", "Very Good", "Good", "Fair"];

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100">
      <div className="container-custom">
        
        {/* Page Header */}
        <div className="mb-8">
          <span className="text-sm font-bold text-orange-400 uppercase tracking-widest font-display">Showroom</span>
          <h1 className="section-title mt-2">Certified Pre-Owned Motorcycles</h1>
          <p className="text-xs text-slate-500 mt-1">Quality checked, serviced and warrantied used bikes at Torque MotoTech, Kannur</p>
        </div>

        {/* Toolbar & Filters */}
        <div className="glass-card p-5 mb-8 bg-dark-100 border border-white/5 flex flex-wrap items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="Search by brand or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input py-2"
            />
            <Button type="submit" variant="accent" size="sm">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            {/* Brand Filter */}
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="bg-dark-200 text-xs text-white px-3 py-2 rounded-xl border border-white/5 outline-none focus:border-orange-500"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Condition Filter */}
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="bg-dark-200 text-xs text-white px-3 py-2 rounded-xl border border-white/5 outline-none focus:border-orange-500"
            >
              <option value="">All Conditions</option>
              {conditions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {(search || brandFilter || conditionFilter) && (
              <button onClick={handleResetFilters} className="text-xs font-semibold text-orange-400 hover:text-orange-300">
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Listings Display */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Spinner size="lg" />
          </div>
        ) : bikes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bikes.map((bike) => (
              <div
                key={bike._id}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-dark-100 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/20 hover:shadow-card flex flex-col"
              >
                
                {/* Bike Image */}
                <div className="aspect-video w-full overflow-hidden bg-dark-200 relative">
                  <img
                    src={bike.images[0]}
                    alt={`${bike.brand} ${bike.model}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-3 right-3 rounded-lg bg-orange-500 px-2.5 py-1 text-xs font-bold text-black shadow-lg">
                    {bike.condition}
                  </span>
                </div>

                {/* Details Section */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-display font-black text-xl text-white leading-tight">
                        {bike.brand} {bike.model}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <FiCalendar size={13} /> {bike.year} Model
                        <span className="text-slate-700">•</span>
                        <FiTrendingUp size={13} /> {bike.kmDriven.toLocaleString()} KM driven
                      </p>
                    </div>
                    <span className="font-display font-black text-xl text-orange-400">
                      {formatPrice(bike.price)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mt-4 mb-6 flex-1">
                    {bike.description}
                  </p>

                  <div className="pt-4 border-t border-white/5 flex gap-3">
                    {/* Call to Action: WhatsApp */}
                    <a
                      href={getWhatsAppLink(bike)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="accent"
                        fullWidth
                        className="flex items-center justify-center gap-2"
                      >
                        <FiMessageCircle size={18} /> Inquire WhatsApp
                      </Button>
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center bg-dark-100 border border-white/5 text-slate-500">
            <p className="text-lg font-bold mb-2">No used bikes listed</p>
            <p className="text-sm">Try resetting filters or check back later.</p>
            <Button onClick={handleResetFilters} variant="accent" className="mt-6">
              Show All Listings
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Bikes;
