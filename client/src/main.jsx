// main.jsx
// WHY: The React entry point — mounts the app into the DOM.
// We wrap everything in providers so any component can access:
//  - BrowserRouter  → URL routing
//  - AuthProvider   → user login state
//  - CartProvider   → shopping cart state
//  - WishlistProvider → wishlist state

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

import { AuthProvider }     from "./context/AuthContext.jsx";
import { CartProvider }     from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* BrowserRouter enables URL-based navigation */}
    <BrowserRouter>
      {/* AuthProvider — must wrap everything since Cart/Wishlist depend on auth */}
      <AuthProvider>
        {/* CartProvider — manages cart state globally */}
        <CartProvider>
          {/* WishlistProvider — manages wishlist state globally */}
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
