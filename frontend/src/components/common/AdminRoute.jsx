import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminRoute() {
  const { token: ctxToken, user: ctxUser } = useAuth();
  const location = useLocation();

  // Fallback to localStorage (handles refresh / initial render timing)
  const token = ctxToken || localStorage.getItem("token");
  const userRaw = ctxUser || (() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  })();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (userRaw?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}