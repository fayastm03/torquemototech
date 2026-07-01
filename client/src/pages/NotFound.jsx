// pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiAlertTriangle } from "react-icons/fi";
import Button from "../components/common/Button";

const NotFound = () => {
  return (
    <div className="page-wrapper min-h-screen bg-dark-300 flex items-center justify-center py-24 px-4 text-center">
      <div className="max-w-md w-full glass-card p-10 bg-dark-100 border border-white/5 shadow-card space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <FiAlertTriangle size={32} />
        </div>
        <h1 className="font-display font-black text-4xl text-white">404 Error</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          The page you are looking for does not exist or has been relocated to another address.
        </p>
        <div className="pt-4">
          <Link to="/">
            <Button variant="accent" className="flex items-center justify-center gap-2 mx-auto">
              <FiHome size={18} /> Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
