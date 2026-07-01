// pages/Rentals.jsx
// WHY: The Vehicle Rentals catalog page. Showcases rental cars and bikes with specs, rates, and WhatsApp booking integration.

import React, { useState, useEffect } from "react";
import { FiSearch, FiSliders, FiMessageCircle, FiCheckCircle, FiXCircle, FiInfo } from "react-icons/fi";
import { getRentals } from "../services/rentalService";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import { formatPrice } from "../utils/helpers";

const Rentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // "" (All), "Bike", "Car"

  const fetchRentalsList = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (search.trim()) params.search = search.trim();

      const data = await getRentals(params);
      setRentals(data || []);
    } catch (err) {
      console.error("Error fetching rentals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalsList();
  }, [typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRentalsList();
  };

  const handleResetFilters = () => {
    setSearch("");
    setTypeFilter("");
  };

  // WhatsApp link generator
  const getWhatsAppLink = (vehicle) => {
    const phone = "917994884603"; // Torque MotoTech contact phone
    const text = `Hi Torque MotoTech, I am interested in renting the ${vehicle.name} (${vehicle.transmission}, ${vehicle.fuelType}) listed at ${formatPrice(vehicle.ratePerDay)}/Day. Is it available for booking?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100">
      <div className="container-custom">

        {/* Page Header */}
        <div className="mb-8">
          <span className="text-sm font-bold text-orange-400 uppercase tracking-widest font-display">Services</span>
          <h1 className="section-title mt-2">Vehicle Rental Services</h1>
          <p className="text-xs text-slate-500 mt-1">Rent high-quality cars and bikes at premium rates from Torque MotoTech, Kannur</p>
        </div>

        {/* Toolbar & Filters */}
        <div className="glass-card p-5 mb-8 bg-dark-100 border border-white/5 flex flex-wrap items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="Search by vehicle name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input py-2"
            />
            <Button type="submit" variant="accent" size="sm">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            {/* Type Selector (All, Bikes, Cars) */}
            <button
              onClick={() => setTypeFilter("")}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                typeFilter === ""
                  ? "bg-orange-500 text-black border-orange-500"
                  : "bg-dark-200 text-white border-white/5 hover:border-orange-500/50"
              }`}
            >
              All Vehicles
            </button>
            <button
              onClick={() => setTypeFilter("Bike")}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                typeFilter === "Bike"
                  ? "bg-orange-500 text-black border-orange-500"
                  : "bg-dark-200 text-white border-white/5 hover:border-orange-500/50"
              }`}
            >
              Bikes
            </button>
            <button
              onClick={() => setTypeFilter("Car")}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                typeFilter === "Car"
                  ? "bg-orange-500 text-black border-orange-500"
                  : "bg-dark-200 text-white border-white/5 hover:border-orange-500/50"
              }`}
            >
              Cars
            </button>

            {(search || typeFilter) && (
              <button onClick={handleResetFilters} className="text-xs font-semibold text-orange-400 hover:text-orange-300 ml-2">
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
        ) : rentals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rentals.map((vehicle) => (
              <div
                key={vehicle._id}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-dark-100 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/20 hover:shadow-card flex flex-col"
              >

                {/* Vehicle Image */}
                <div className="aspect-video w-full overflow-hidden bg-dark-200 relative">
                  <img
                    src={vehicle.images[0]}
                    alt={vehicle.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className={`absolute top-3 right-3 rounded-lg px-2.5 py-1 text-xs font-bold shadow-lg flex items-center gap-1.5 ${
                    vehicle.availability 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}>
                    {vehicle.availability ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                    {vehicle.availability ? "Available" : "Rented Out"}
                  </span>
                </div>

                {/* Details Section */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-display font-black text-xl text-white leading-tight">
                        {vehicle.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="bg-dark-200 text-slate-300 px-2 py-0.5 rounded border border-white/5 font-semibold text-[10px]">
                          {vehicle.type}
                        </span>
                        <span>•</span>
                        <span>{vehicle.transmission}</span>
                        <span>•</span>
                        <span>{vehicle.fuelType}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-black text-xl text-orange-400 block leading-none">
                        {formatPrice(vehicle.ratePerDay)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase mt-1 block">per day</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mt-4 mb-6 flex-1">
                    {vehicle.description}
                  </p>

                  <div className="pt-4 border-t border-white/5">
                    {/* Call to Action */}
                    {vehicle.availability ? (
                      <a
                        href={getWhatsAppLink(vehicle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                      >
                        <Button
                          variant="accent"
                          fullWidth
                          className="flex items-center justify-center gap-2"
                        >
                          <FiMessageCircle size={18} /> Book via WhatsApp
                        </Button>
                      </a>
                    ) : (
                      <Button
                        variant="secondary"
                        fullWidth
                        disabled
                        className="flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <FiInfo size={18} /> Currently Unavailable
                      </Button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center bg-dark-100 border border-white/5 text-slate-500">
            <p className="text-lg font-bold mb-2">No rental vehicles listed</p>
            <p className="text-sm">Try resetting filters or search query.</p>
            <Button onClick={handleResetFilters} variant="accent" className="mt-6">
              Show All Vehicles
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Rentals;
