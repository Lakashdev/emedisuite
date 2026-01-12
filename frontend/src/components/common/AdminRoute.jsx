import { Navigate, Outlet } from "react-router-dom";

/**
 * Temporary admin guard.
 * Later we’ll wire real auth + role check.
 */
export default function AdminRoute() {
  const user = null; // TODO: replace with auth state

  // Not logged in or not admin → redirect
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
