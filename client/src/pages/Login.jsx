// pages/Login.jsx
// WHY: Login form matching the moto styling theme. Connects to AuthContext login.

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMail, FiLock, FiChevronRight, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  // Path to redirect after login (default is Home)
  const from = location.state?.from || "/";

  // Check if redirect contains warning about expired session
  const showSessionWarning = new URLSearchParams(location.search).get("session") === "expired";

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Please enter email and password");
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper min-h-screen bg-dark-300 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-card p-8 bg-dark-100 border border-white/5 shadow-card animate-scale-in">
        
        {/* Logo and Header */}
        <div className="text-center">
          <img
            src="/logo.jpg"
            alt="Torque MotoTech Logo"
            className="mx-auto w-12 h-12 rounded-xl object-cover mb-4"
          />
          <h2 className="font-display font-black text-3xl text-white">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-2">Log in to your Torque MotoTech account</p>
        </div>

        {/* Expired Session Warning */}
        {showSessionWarning && (
          <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-4 text-xs text-orange-400 flex gap-2.5 items-start">
            <FiAlertCircle className="flex-shrink-0 mt-0.5" size={16} />
            <span>Your session has expired. Please log in again to access your cart and bookings.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div className="space-y-4">
            
            {/* Email */}
            <div>
              <label className="form-label flex items-center gap-2">
                <FiMail size={14} /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="form-input"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label flex items-center gap-2 mb-0">
                  <FiLock size={14} /> Password
                </label>
                <Link to="#" className="text-xs font-semibold text-orange-400 hover:text-orange-300">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="form-input"
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
            id="login-submit-btn"
          >
            Login <FiChevronRight size={16} />
          </Button>
        </form>

        {/* Bottom Switch Link */}
        <div className="text-center text-xs text-slate-500 pt-4 border-t border-white/5">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-orange-400 hover:text-orange-300 transition-colors">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
