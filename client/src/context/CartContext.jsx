// context/CartContext.jsx
// WHY: Global cart state that syncs with our backend API.
// Any component can useCart() to read or update the cart.

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart]       = useState({ items: [], totalPrice: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);

  // ── Fetch cart when user logs in ──────────────────────────────────────
  useEffect(() => {
    if (user) fetchCart();
    else setCart({ items: [], totalPrice: 0, totalItems: 0 });
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/cart");
      setCart(data.data.cart);
    } catch {
      // Silent fail — cart just shows empty
    } finally {
      setLoading(false);
    }
  };

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      const { data } = await api.post("/cart", { productId, quantity });
      setCart(data.data.cart);
      toast.success("Added to cart!");
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not add to cart");
      return false;
    }
  }, []);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      setCart(data.data.cart);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update quantity");
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      setCart(data.data.cart);
      toast.success("Item removed");
    } catch {
      toast.error("Could not remove item");
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await api.delete("/cart");
      setCart({ items: [], totalPrice: 0, totalItems: 0 });
    } catch {
      // Silent
    }
  }, []);

  const isInCart = useCallback(
    (productId) => cart.items?.some((i) => i.product?._id === productId || i.product === productId),
    [cart.items]
  );

  return (
    <CartContext.Provider value={{
      cart, loading,
      addToCart, updateQuantity, removeItem, clearCart,
      fetchCart, isInCart,
      itemCount: cart.totalItems || 0,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
