// pages/admin/Users.jsx
// WHY: Table list of all user accounts for the admin.

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiUserCheck, FiTrash2, FiSearch } from "react-icons/fi";
import api from "../../services/api";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = search.trim() ? { search: search.trim() } : {};
      const { data } = await api.get("/admin/users", { params });
      setUsers(data.data.users || []);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      toast.success("User role updated successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update user role");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user account?")) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("User account deleted successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="page-wrapper bg-dark-300 min-h-screen text-slate-100 animate-fade-in">
      <div className="container-custom">
        
        {/* Title */}
        <div className="mb-8">
          <Link to="/admin" className="text-xs font-semibold text-orange-400 hover:text-orange-300">
            ← Back to Dashboard
          </Link>
          <h1 className="section-title mt-2">Manage User Roles</h1>
          <p className="text-xs text-slate-500 mt-1">Search user details and configure accounts</p>
        </div>

        {/* Toolbar */}
        <div className="glass-card p-4 mb-6 bg-dark-100 border border-white/5 flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input py-2"
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Spinner size="lg" />
          </div>
        ) : users.length > 0 ? (
          <div className="glass-card bg-dark-100 border border-white/5 overflow-x-auto rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-dark-200/50 text-slate-400 uppercase tracking-widest font-semibold">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-slate-200">{u.name}</td>
                    <td className="p-4 text-slate-300">{u.email}</td>
                    <td className="p-4">
                      <Badge color={u.role === "admin" ? "accent" : "primary"}>
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-400">{formatDate(u.createdAt)}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleRoleToggle(u._id, u.role)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-semibold"
                        title="Toggle Admin Privilege"
                      >
                        <FiUserCheck size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete User"
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
            No registered users found matching search term.
          </div>
        )}

      </div>
    </div>
  );
};

export default Users;
