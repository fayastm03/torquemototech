// pages/Home.jsx
// WHY: The primary landing page for Torque MotoTech. Welcomes users, showcases services, featured items, and listings.

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSettings, FiShield, FiTag, FiClock, FiMapPin,
  FiPhone, FiStar, FiArrowRight, FiArrowLeft, FiMessageCircle,
} from "react-icons/fi";
import { getFeaturedProducts } from "../services/productService";
import { getBikes } from "../services/bikeService";
import { getRentals } from "../services/rentalService";
import ProductCard from "../components/product/ProductCard";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import { formatPrice } from "../utils/helpers";
import toast from "react-hot-toast";

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodData, bikeData, rentalData] = await Promise.all([
          getFeaturedProducts(),
          getBikes(),
          getRentals(),
        ]);
        setProducts(prodData || []);
        setBikes(bikeData || []);
        setRentals(rentalData || []);
      } catch (err) {
        console.error("Home page data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const garageServices = [
    {
      title: "General Service",
      desc: "Complete checkup, lubrication, brake adjustments, chain cleaning, oiling, wash & polish.",
      price: "₹899 onwards",
      image: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600",
    },
    {
      title: "Engine Repair & Tuning",
      desc: "Major engine overhauls, valve adjustments, compression restores, tuning for peak performance.",
      price: "Estimate on inspection",
      image: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600",
    },
    {
      title: "Oil Change & Filters",
      desc: "Replacement with high-quality synthetic lubricants (Motul, Castrol) and fresh OEM oil filters.",
      price: "Oil Cost + ₹150",
      image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600",
    },
    {
      title: "Custom Modifications",
      desc: "Exhaust fits, handle modifications, performance air filters, tail tidies, auxiliary lights.",
      price: "Custom quotation",
      image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600",
    },
  ];

  const testReviews = [
    {
      name: "Abhinav Nair",
      role: "KTM RC 390 Owner",
      stars: 5,
      review: "The best garage in Kannur! They solved a gear shifting issue on my RC390 that other mechanics couldn't figure out. Highly professional mechanical work.",
    },
    {
      name: "Fadhil Ahmed",
      role: "Royal Enfield Owner",
      stars: 5,
      review: "Bought a used Royal Enfield Classic 350 from Torque MotoTech. Smooth transaction, vehicle was fully serviced and delivered in excellent condition. Highly recommended!",
    },
    {
      name: "Midhun Lal",
      role: "Yamaha R15 Owner",
      stars: 5,
      review: "Got my MT Hummer Helmet and riding gloves here. Original, premium accessories store right in Kannur at reasonable pricing.",
    },
  ];

  return (
    <div className="bg-dark-300 min-h-screen text-slate-100 animate-fade-in">
      
      {/* ── HERO BANNER ────────────────────────────────────────────────── */}
      <section className="relative h-[90vh] w-full flex items-center overflow-hidden bg-black/60">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1600"
            alt="Motorcycle garage banner"
            className="h-full w-full object-cover object-center opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-300 via-dark-300/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-300 to-transparent" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-2xl">
            <span className="inline-block rounded-lg bg-orange-500/10 px-3 py-1 text-sm font-bold text-orange-400 border border-orange-500/20 mb-4 tracking-wider uppercase">
              Power. Performance. Precision.
            </span>
            <h1 className="font-display font-black text-5xl md:text-6xl text-white tracking-tight leading-none mb-6">
              Welcome to <br />
              <span className="gradient-text">Torque MotoTech</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Your premium motorcycle garage, pre-owned bike dealer, and high-performance accessory shop located in Kannur, Kerala. Professional servicing and genuine parts.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate("/book-service")} variant="accent">
                Book a Service
              </Button>
              <Button onClick={() => navigate("/shop")} variant="ghost">
                Explore Store
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── BRAND INTRODUCTION ────────────────────────────────────────── */}
      <section className="py-16 bg-dark-200">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="section-title mb-6">Kannur's Ultimate Motorcycle Destination</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              At Torque MotoTech, motorcycles are not just transport, they are our passion. Located in Billupalam, Kannur, we serve riders with professional mechanical repairs, diagnostic evaluations, custom accessories installation, and premium safety gear.
            </p>
            <p className="text-slate-400 leading-relaxed mb-8">
              We also maintain a select showroom of certified pre-owned motorcycles, thoroughly checked and serviced by our senior mechanics. Every bike we sell meets our strict standards of reliability and performance.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 flex-shrink-0">
                  <FiSettings size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Expert Mechanics</h4>
                  <p className="text-xs text-slate-500 mt-1">Certified multi-brand technicians</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 flex-shrink-0">
                  <FiShield size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">100% Genuine Parts</h4>
                  <p className="text-xs text-slate-500 mt-1">Direct from manufacturer</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/5 shadow-card group">
            <img
              src="https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=800"
              alt="Motorcycle tuning"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* ── GARAGE SERVICES ────────────────────────────────────────────── */}
      <section className="py-20 bg-dark-300">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-sm font-bold text-orange-400 uppercase tracking-widest">Professional Garage Work</span>
              <h2 className="section-title mt-2">Our Repair & Tuning Services</h2>
            </div>
            <Button onClick={() => navigate("/book-service")} variant="outline">
              Book Appointment <FiArrowRight size={16} />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {garageServices.map((service, index) => (
              <div
                key={service.title}
                className="glass-card flex flex-col h-full overflow-hidden border border-white/5 bg-dark-100 hover:border-orange-500/30 hover:shadow-card group"
              >
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display font-black text-lg text-white mb-2">{service.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 flex-1">{service.desc}</p>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-orange-400 font-bold">{service.price}</span>
                    <Link to="/book-service" className="text-xs font-semibold text-white hover:text-orange-400 flex items-center gap-1 transition-colors">
                      Book Now <FiArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── VEHICLE RENTAL FLEET ───────────────────────────────────────── */}
      <section className="py-20 bg-dark-300 border-t border-b border-white/5">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-bold text-orange-400 uppercase tracking-widest">Explore Kannur</span>
              <h2 className="section-title mt-2 font-display">Premium Car & Bike Rentals</h2>
              <p className="text-xs text-slate-500 mt-1">Rent top-tier motorcycles & premium cars for local rides</p>
            </div>
            <Link to="/rentals" className="text-xs sm:text-sm font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 transition-colors">
              View All Fleet <FiArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : rentals.length > 0 ? (
            <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rentals.slice(0, 4).map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="glass-card flex-shrink-0 w-[280px] md:w-auto snap-start flex flex-col h-full overflow-hidden border border-white/5 bg-dark-100 hover:border-orange-500/30 hover:shadow-card group"
                >
                  {/* Image container */}
                  <div className="aspect-[4/3] w-full overflow-hidden relative">
                    <img
                      src={vehicle.images[0]}
                      alt={vehicle.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-dark-300/80 text-orange-400 border border-white/5 backdrop-blur-sm">
                        {vehicle.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold backdrop-blur-sm border ${
                        vehicle.availability
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {vehicle.availability ? "Available" : "Rented Out"}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-display font-black text-sm text-white mb-2 line-clamp-1 group-hover:text-orange-400 transition-colors">
                      {vehicle.name}
                    </h3>
                    
                    <div className="flex gap-2 mb-4">
                      <span className="px-2 py-0.5 rounded text-[9px] bg-dark-200 text-slate-400 border border-white/5">
                        {vehicle.transmission}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] bg-dark-200 text-slate-400 border border-white/5">
                        {vehicle.fuelType}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Rate</span>
                        <span className="text-xs font-black text-white">{formatPrice(vehicle.ratePerDay)} <span className="text-[10px] font-normal text-slate-500">/ Day</span></span>
                      </div>
                      <Link
                        to="/rentals"
                        className="text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-200"
                      >
                        Book Ride
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">No rental vehicles available in the fleet.</div>
          )}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS (STORE) ─────────────────────────────────── */}
      <section className="py-20 bg-dark-200">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-bold text-orange-400 uppercase tracking-widest">Pro Store</span>
              <h2 className="section-title mt-2">Performance Parts & Riding Gear</h2>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 transition-colors">
              View All Products <FiArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">No products found in store database.</div>
          )}
        </div>
      </section>

      {/* ── USED BIKES SECTION ─────────────────────────────────────────── */}
      <section className="py-20 bg-dark-300">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-bold text-orange-400 uppercase tracking-widest">Pre-Owned Motorcycles</span>
              <h2 className="section-title mt-2">Latest Used Bike Listings</h2>
            </div>
            <Link to="/bikes" className="text-sm font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 transition-colors">
              Explore All Bikes <FiArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : bikes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bikes.slice(0, 3).map((bike) => (
                <div key={bike._id} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-dark-100 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/20 hover:shadow-card flex flex-col">
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
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-display font-black text-lg text-white leading-tight">{bike.brand} {bike.model}</h3>
                        <p className="text-xs text-slate-500 mt-1">{bike.year} Model • {bike.kmDriven.toLocaleString()} KM</p>
                      </div>
                      <span className="font-display font-black text-lg text-white">{formatPrice(bike.price)}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-4 mb-6 line-clamp-2">
                      {bike.description}
                    </p>
                    <div className="mt-auto">
                      <Button
                        onClick={() => navigate(`/bikes`)}
                        variant="outline"
                        fullWidth
                        size="sm"
                      >
                        Inquire Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">No used bikes currently listed. Check back soon!</div>
          )}
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS ───────────────────────────────────────────── */}
      <section className="py-20 bg-dark-200">
        <div className="container-custom">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-sm font-bold text-orange-400 uppercase tracking-widest">Testimonials</span>
            <h2 className="section-title mt-2">What Our Riders Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testReviews.map((rev) => (
              <div key={rev.name} className="glass-card p-8 bg-dark-100 border border-white/5 relative">
                <div className="flex items-center gap-0.5 text-amber-400 mb-4">
                  {[...Array(rev.stars)].map((_, i) => (
                    <FiStar key={i} className="fill-current" size={16} />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                  "{rev.review}"
                </p>
                <div>
                  <h4 className="font-bold text-white text-sm">{rev.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{rev.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT & MAP SECTION ───────────────────────────────────────── */}
      <section className="py-20 bg-dark-300 border-t border-white/5">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <span className="text-sm font-bold text-orange-400 uppercase tracking-widest">Visit Us</span>
            <h2 className="section-title mt-2 mb-6">Our Motorcycle Workshop</h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Drop by for general maintenance, chain adjusts, accessory installations, or check out our used bikes range. We are located centrally at Billupalam, Kannur.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 flex-shrink-0">
                  <FiMapPin size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Location</h4>
                  <p className="text-xs text-slate-500 mt-1">VC8W+FWQ, Billupalam, Kannur, Chala, Kerala 670621</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 flex-shrink-0">
                  <FiPhone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Phone</h4>
                  <p className="text-xs text-slate-500 mt-1">7994884603 / 9526917127</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 flex-shrink-0">
                  <FiClock size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Working Hours</h4>
                  <p className="text-xs text-slate-500 mt-1">Monday - Saturday: 9:00 AM - 7:30 PM (Sunday Closed)</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <a href="https://wa.me/917994884603" target="_blank" rel="noreferrer">
                <Button variant="accent" className="flex items-center gap-2">
                  <FiMessageCircle size={18} /> WhatsApp Inquiry
                </Button>
              </a>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/5 min-h-[300px] bg-dark-200">
            {/* Embedded maps or mock styling */}
            <iframe
              title="Torque MotoTech Garage Location Map"
              src="https://maps.google.com/maps?q=VC8W%2BFWQ%2C%20Billupalam%2C%20Kannur%2C%20Chala%2C%20Kerala%20670621&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "350px", opacity: 0.85 }}
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
