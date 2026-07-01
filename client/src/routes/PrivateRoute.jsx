// routes/PrivateRoute.jsx
// WHY: Wraps pages that require login.
// If a visitor tries to access /cart or /orders without being logged in,
// they get redirected to /login with a "redirect" URL saved.
// After login, they'll be sent back to where they wanted to go.

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While auth state is loading, show a spinner (don't flash redirect)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Not logged in → redirect to login, save current path so we can return
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default PrivateRoute;
