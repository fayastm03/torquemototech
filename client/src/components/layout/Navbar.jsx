// components/layout/Navbar.jsx
// WHY: The Navbar is the primary navigation for the entire app.
// Features:
//  - Sticky top with glass blur effect on scroll
//  - Brand logo
//  - Desktop nav links
//  - Live cart item count badge
//  - User dropdown menu (profile, orders, logout)
//  - Mobile hamburger menu (fully responsive)
//  - Admin link if user is admin

import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut,
  FiPackage, FiHeart, FiSettings, FiChevronDown,
  FiSearch, FiHome, FiGrid,
} from "react-icons/fi";
import { useAuth }     from "../../context/AuthContext";
import { useCart }     from "../../context/CartContext";

const Navbar = () => {
  const { user, logout }      = useAuth();
  const { itemCount }         = useCart();
  const navigate              = useNavigate();
  const location              = useLocation();

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const userMenuRef = useRef(null);
  const searchRef   = useRef(null);

  // ── Scroll detection — add glass bg when scrolled ─────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Close menus on route change ────────────────────────────────────────
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // ── Close user menu on outside click ──────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Search submit ──────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ── Nav links config ───────────────────────────────────────────────────
  const navLinks = [
    { to: "/",            label: "Home",         icon: <FiHome size={15} /> },
    { to: "/shop",        label: "Store",        icon: <FiGrid size={15} /> },
    { to: "/bikes",       label: "Used Bikes",   icon: <FiPackage size={15} /> },
    { to: "/rentals",     label: "Rentals",      icon: <FiCalendar size={15} /> },
    { to: "/book-service",label: "Book Service", icon: <FiSettings size={15} /> },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-dark-200/90 backdrop-blur-xl border-b border-white/5 shadow-card"
            : "bg-transparent"
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ────────────────────────────────────────────────── */}
            <Link
              to="/"
              className="flex items-center gap-2 group flex-shrink-0"
            >
              <img
                src="/logo.jpg"
                alt="Torque MotoTech Logo"
                className="w-8 h-8 rounded-lg object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <span className="font-display font-black text-xl tracking-tight">
                Torque<span className="gradient-text"> MotoTech</span>
              </span>
            </Link>

            {/* ── Desktop Nav Links ────────────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `nav-link flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium
                     transition-all duration-200
                     ${isActive
                       ? "text-white bg-white/5"
                       : "text-slate-400 hover:text-white hover:bg-white/5"
                     }`
                  }
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}

              {user?.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium
                     transition-all duration-200
                     ${isActive
                       ? "text-primary-400 bg-primary-500/10"
                       : "text-slate-400 hover:text-primary-400 hover:bg-primary-500/10"
                     }`
                  }
                >
                  <FiSettings size={15} />
                  Admin
                </NavLink>
              )}
            </nav>

            {/* ── Right Side Actions ───────────────────────────────────── */}
            <div className="flex items-center gap-1">

              {/* Search Icon */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-9 h-9 rounded-lg flex items-center justify-center
                           text-slate-400 hover:text-white hover:bg-white/5
                           transition-all duration-200"
                aria-label="Search"
                id="navbar-search-btn"
              >
                <FiSearch size={18} />
              </button>

              {/* Wishlist */}
              {user && (
                <Link
                  to="/wishlist"
                  className="w-9 h-9 rounded-lg flex items-center justify-center
                             text-slate-400 hover:text-rose-400 hover:bg-white/5
                             transition-all duration-200"
                  aria-label="Wishlist"
                >
                  <FiHeart size={18} />
                </Link>
              )}

              {/* Cart with badge */}
              {user && (
                <Link
                  to="/cart"
                  className="relative w-9 h-9 rounded-lg flex items-center justify-center
                             text-slate-400 hover:text-white hover:bg-white/5
                             transition-all duration-200"
                  aria-label={`Cart (${itemCount} items)`}
                  id="navbar-cart-btn"
                >
                  <FiShoppingCart size={18} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4
                                     flex items-center justify-center
                                     text-[10px] font-bold text-white rounded-full
                                     animate-scale-in"
                      style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Menu / Login */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5
                               rounded-xl border border-white/10
                               hover:border-primary-500/40 hover:bg-primary-500/5
                               transition-all duration-200 group"
                    id="navbar-user-menu"
                  >
                    {/* Avatar circle */}
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #6366f1, #f97316)" }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-300 group-hover:text-white max-w-[80px] truncate">
                      {user.name?.split(" ")[0]}
                    </span>
                    <FiChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 glass-card py-2 animate-scale-in">
                      {/* User info */}
                      <div className="px-4 py-2 border-b border-white/5 mb-1">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      <DropdownLink to="/profile"  icon={<FiUser size={15}/>}    label="My Profile" />
                      <DropdownLink to="/orders"   icon={<FiPackage size={15}/>}  label="My Orders" />
                      <DropdownLink to="/wishlist" icon={<FiHeart size={15}/>}   label="Wishlist" />

                      {user.role === "admin" && (
                        <DropdownLink to="/admin" icon={<FiSettings size={15}/>} label="Admin Panel"
                          className="text-primary-400" />
                      )}

                      <div className="border-t border-white/5 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5
                                     text-sm text-red-400 hover:bg-red-500/10
                                     transition-colors duration-200 rounded-lg mx-1"
                          style={{ width: "calc(100% - 8px)" }}
                        >
                          <FiLogOut size={15} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm px-4 py-2" id="navbar-login-btn">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm px-4 py-2" id="navbar-register-btn">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center
                           text-slate-400 hover:text-white hover:bg-white/5
                           transition-all duration-200 ml-1"
                aria-label="Toggle menu"
                id="navbar-mobile-toggle"
              >
                {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Search Bar (expandable) ──────────────────────────────────── */}
        {searchOpen && (
          <div className="border-t border-white/5 bg-dark-200/95 backdrop-blur-xl animate-fade-in">
            <div className="container-custom py-3">
              <form onSubmit={handleSearch} className="relative">
                <FiSearch
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  ref={searchRef}
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands, categories..."
                  className="form-input pl-11 pr-12"
                  id="navbar-search-input"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-xs font-semibold text-primary-400
                             hover:text-primary-300 transition-colors px-2 py-1
                             bg-primary-500/10 rounded-lg"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Mobile Menu ──────────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-dark-200/98 backdrop-blur-xl animate-fade-in">
            <div className="container-custom py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                     ${isActive
                       ? "text-white bg-primary-500/10 border border-primary-500/20"
                       : "text-slate-400 hover:text-white hover:bg-white/5"
                     }`
                  }
                >
                  {link.icon} {link.label}
                </NavLink>
              ))}

              {user ? (
                <>
                  <NavLink to="/cart"    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5">
                    <FiShoppingCart size={15}/> Cart {itemCount > 0 && <span className="badge-primary ml-auto">{itemCount}</span>}
                  </NavLink>
                  <NavLink to="/orders"  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5">
                    <FiPackage size={15}/> My Orders
                  </NavLink>
                  <NavLink to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5">
                    <FiUser size={15}/> Profile
                  </NavLink>
                  {user.role === "admin" && (
                    <NavLink to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-primary-400 hover:bg-primary-500/10">
                      <FiSettings size={15}/> Admin Panel
                    </NavLink>
                  )}
                  <div className="border-t border-white/5 pt-2 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <FiLogOut size={15} /> Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Link to="/login"    className="btn-ghost flex-1 justify-center text-sm">Login</Link>
                  <Link to="/register" className="btn-primary flex-1 justify-center text-sm">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Spacer so page content doesn't hide under fixed navbar */}
      <div className="h-16" />
    </>
  );
};

// ── Dropdown Link Helper ───────────────────────────────────────────────────
const DropdownLink = ({ to, icon, label, className = "" }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-2.5 mx-1 rounded-lg
                text-sm text-slate-300 hover:text-white hover:bg-white/5
                transition-colors duration-200 ${className}`}
  >
    <span className="text-slate-400">{icon}</span>
    {label}
  </Link>
);

export default Navbar;
