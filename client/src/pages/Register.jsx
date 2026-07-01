// pages/Register.jsx
// WHY: Register form matching the moto styling theme. Connects to AuthContext register.

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiChevronRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import toast from "react-hot-toast";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading]       = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPass) {
      return toast.error("Please fill in all fields");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (password !== confirmPass) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      await register(name, email, password);
      toast.success("Account created successfully!");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed. Try again.");
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
          <h2 className="font-display font-black text-3xl text-white">Create Account</h2>
          <p className="text-xs text-slate-500 mt-2">Get started with Torque MotoTech today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          <div className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="form-label flex items-center gap-2">
                <FiUser size={14} /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Varma"
                className="form-input"
                required
              />
            </div>

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
              <label className="form-label flex items-center gap-2">
                <FiLock size={14} /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="form-input"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label flex items-center gap-2">
                <FiLock size={14} /> Confirm Password
              </label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-enter password"
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
            className="flex justify-center items-center gap-1.5 mt-6"
            id="register-submit-btn"
          >
            Register <FiChevronRight size={16} />
          </Button>
        </form>

        {/* Bottom Switch Link */}
        <div className="text-center text-xs text-slate-500 pt-4 border-t border-white/5">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-orange-400 hover:text-orange-300 transition-colors">
            Login Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
