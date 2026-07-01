// App.jsx
// WHY: The top-level component that defines ALL routes of the application.
// React Router DOM's <Routes> + <Route> maps URL paths to page components.
// Layout (Navbar + Footer) wraps all user-facing pages.

import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ── Layout Components ──────────────────────────────────────────────────────
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// ── Route Guards ───────────────────────────────────────────────────────────
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute  from "./routes/AdminRoute";

// ── Public Pages ───────────────────────────────────────────────────────────
import Home         from "./pages/Home";
import Shop         from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Bikes         from "./pages/Bikes";
import Rentals       from "./pages/Rentals";
import Bookings      from "./pages/Bookings";
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import NotFound     from "./pages/NotFound";

// ── Private Pages (requires login) ────────────────────────────────────────
import Cart         from "./pages/Cart";
import Checkout     from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";
import OrderDetail  from "./pages/OrderDetail";
import Profile      from "./pages/Profile";
import Wishlist     from "./pages/Wishlist";

// ── Admin Pages ────────────────────────────────────────────────────────────
import AdminDashboard  from "./pages/admin/Dashboard";
import AdminProducts   from "./pages/admin/Products";
import AdminOrders     from "./pages/admin/Orders";
import AdminUsers      from "./pages/admin/Users";
import AddProduct      from "./pages/admin/AddProduct";
import EditProduct     from "./pages/admin/EditProduct";
import AdminBikes      from "./pages/admin/Bikes";
import AdminRentals    from "./pages/admin/Rentals";

function App() {
  return (
    <>
      {/* ── Toast Notifications ─────────────────────────────────────── */}
      {/* react-hot-toast gives us beautiful toast messages anywhere */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e1e2e",
            color:      "#f1f5f9",
            border:     "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            fontSize:   "14px",
            fontWeight: "500",
          },
          success: {
            iconTheme: { primary: "#22c55e", secondary: "#1e1e2e" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#1e1e2e" },
          },
        }}
      />

      {/* ── Navbar (always visible) ──────────────────────────────────── */}
      <Navbar />

      {/* ── Page Routes ─────────────────────────────────────────────── */}
      <Routes>
        {/* Public Routes */}
        <Route path="/"             element={<Home />} />
        <Route path="/shop"         element={<Shop />} />
        <Route path="/shop/:id"     element={<ProductDetail />} />
        <Route path="/bikes"        element={<Bikes />} />
        <Route path="/rentals"      element={<Rentals />} />
        <Route path="/book-service" element={<Bookings />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/register"     element={<Register />} />

        {/* Private Routes — wrapped in <PrivateRoute> */}
        <Route path="/cart"    element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/orders"  element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
        <Route path="/orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />

        {/* Admin Routes — wrapped in <AdminRoute> */}
        <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products"  element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/products/add"       element={<AdminRoute><AddProduct /></AdminRoute>} />
        <Route path="/admin/products/edit/:id"  element={<AdminRoute><EditProduct /></AdminRoute>} />
        <Route path="/admin/orders"    element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/users"     element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/bikes"     element={<AdminRoute><AdminBikes /></AdminRoute>} />
        <Route path="/admin/rentals"   element={<AdminRoute><AdminRentals /></AdminRoute>} />

        {/* 404 — must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <Footer />
    </>
  );
}

export default App;
