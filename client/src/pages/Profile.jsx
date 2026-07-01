// pages/Profile.jsx
// WHY: Profile management page. Allows updating personal details and changing passwords.

import React, { useState } from "react";
import { FiUser, FiMail, FiLock, FiCalendar, FiChevronRight, FiEdit2, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Button from "../components/common/Button";
import { formatDate } from "../utils/helpers";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateUser } = useAuth();

  // Profile details state
  const [name, setName] = useState(user?.name || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty");

    try {
      setUpdatingProfile(true);
      const { data } = await api.put("/auth/me", { name });
      updateUser(data.data);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("All password fields are required");
    }

    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }

    try {
      setUpdatingPassword(true);
      await api.put("/auth/password", { currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100 animate-fade-in">
      <div className="container-custom max-w-4xl">
        
        {/* Title */}
        <div className="mb-8">
          <span className="text-sm font-bold text-orange-400 uppercase tracking-widest font-display">Account</span>
          <h1 className="section-title mt-2">Your Profile</h1>
          <p className="text-xs text-slate-500 mt-1">Manage personal details, avatar, and security passwords</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Info Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass-card p-6 bg-dark-100 border border-white/5 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <h3 className="font-display font-black text-lg text-white truncate">{user?.name}</h3>
              <span className="badge-primary mt-2 text-[10px] uppercase font-bold tracking-wider">
                {user?.role} Account
              </span>
              
              <div className="border-t border-white/5 mt-6 pt-6 text-left text-xs text-slate-400 space-y-3">
                <p className="flex items-center gap-2">
                  <FiMail className="text-slate-500" /> {user?.email}
                </p>
                <p className="flex items-center gap-2">
                  <FiCalendar className="text-slate-500" /> Registered {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Update Info */}
            <div className="glass-card p-6 bg-dark-100 border border-white/5">
              <h3 className="font-display font-black text-base text-white mb-6 flex items-center gap-2">
                <FiEdit2 size={16} className="text-orange-500" /> Personal Details
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" variant="accent" loading={updatingProfile} size="sm">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="glass-card p-6 bg-dark-100 border border-white/5">
              <h3 className="font-display font-black text-base text-white mb-6 flex items-center gap-2">
                <FiLock size={16} className="text-orange-500" /> Security Password
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••"
                    className="form-input"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button type="submit" variant="accent" loading={updatingPassword} size="sm">
                    Change Password
                  </Button>
                </div>
              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
