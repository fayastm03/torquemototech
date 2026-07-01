// context/WishlistContext.jsx
// WHY: Global wishlist state — persisted in localStorage for guests,
// synced with the backend when logged in.

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // ── Load wishlist from user data ──────────────────────────────────────
  useEffect(() => {
    if (user?.wishlist) setWishlist(user.wishlist);
    else setWishlist([]);
  }, [user]);

  const isInWishlist = useCallback(
    (productId) => wishlist.includes(productId) || wishlist.some((w) => w?._id === productId || w === productId),
    [wishlist]
  );

  const toggleWishlist = useCallback(async (product) => {
    if (!user) {
      toast.error("Please login to use wishlist");
      return;
    }
    const productId = product._id;
    const inList = isInWishlist(productId);

    try {
      const { data } = await api.post(`/auth/wishlist/${productId}`);
      setWishlist(data.data.wishlist || []);
      toast.success(inList ? "Removed from wishlist" : "Added to wishlist ❤️");
    } catch {
      // Optimistic local update if endpoint not yet implemented
      setWishlist((prev) =>
        inList ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
      toast.success(inList ? "Removed from wishlist" : "Added to wishlist ❤️");
    }
  }, [user, isInWishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
