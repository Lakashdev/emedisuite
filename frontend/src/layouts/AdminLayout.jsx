import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ adjust path if your AdminLayout is in different folder

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-3 ${
      isActive ? "bg-primary text-white" : "text-white-50"
    }`;

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      {/* Sidebar */}
      <aside
        className="text-white d-flex flex-column"
        style={{
          width: 270,
          background: "linear-gradient(180deg, #0b1320 0%, #0d1b2a 100%)",
          borderRight: "1px solid rgba(255,255,255,.08)",
        }}
      >
        {/* Brand */}
        <div className="p-3 border-bottom" style={{ borderColor: "rgba(255,255,255,.08)" }}>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div className="fw-bold" style={{ letterSpacing: ".2px" }}>
                MediSuite
              </div>
              <div className="small text-white-50">Admin Panel</div>
            </div>

            {/* Link to main site */}
            <Link
              to="/"
              className="btn btn-sm btn-outline-light"
              title="Go to website"
              style={{ borderColor: "rgba(255,255,255,.25)" }}
            >
              Website
            </Link>
          </div>
        </div>

        {/* User */}
        <div className="p-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: 42,
                height: 42,
                background: "rgba(255,255,255,.12)",
                border: "1px solid rgba(255,255,255,.15)",
                fontWeight: 700,
              }}
            >
              {(user?.name?.[0] || "A").toUpperCase()}
            </div>
            <div className="flex-grow-1">
              <div className="fw-semibold">{user?.name || "Admin"}</div>
              <div className="small text-white-50">{user?.email || "admin"}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-2 pb-3 flex-grow-1">
          <div className="small text-white-50 px-3 mb-2">MANAGE</div>

          <NavLink to="/admin" end className={navLinkClass}>
            <span>📊</span> <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/admin/brands" className={navLinkClass}>
            <span>Brands</span>
          </NavLink>

          <NavLink to="/admin/categories" className={navLinkClass}>
            <span>Categories</span>
          </NavLink>

          <NavLink to="/admin/products" className={navLinkClass}>
            <span>Products</span>
          </NavLink>

          <NavLink to="/admin/orders" className={navLinkClass}>
            <span>🧾</span> <span>Orders</span>
          </NavLink>

          <NavLink to="/admin/settings" className={navLinkClass}>
            <span>⚙️</span> <span>Settings</span>
          </NavLink>
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-top" style={{ borderColor: "rgba(255,255,255,.08)" }}>
          <button
            onClick={onLogout}
            className="btn btn-outline-light w-100"
            style={{ borderColor: "rgba(255,255,255,.25)" }}
          >
            Logout
          </button>

          <div className="small text-white-50 mt-3 text-center">
            © {new Date().getFullYear()} MediSuite
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Topbar */}
        <header className="bg-white border-bottom">
          <div className="container-fluid py-3 d-flex align-items-center justify-content-between">
            <div className="fw-semibold">Admin Dashboard</div>

            <div className="d-flex align-items-center gap-2">
              <span className="badge text-bg-light border">
                Role: {user?.role || "admin"}
              </span>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="container-fluid py-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}