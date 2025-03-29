import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import authService from "../../services/authService";

function ProtectedRoute() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await authService.isAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    // Show loading state while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-accent dark:border-dark-accent"></div>
      </div>
    );
  }

  // If not an admin, redirect to login page with the return path
  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated and admin, render the child routes
  return <Outlet />;
}

export default ProtectedRoute;
