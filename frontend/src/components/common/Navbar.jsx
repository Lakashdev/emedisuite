import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/logo.jpg";
import { useAuth } from "../../context/AuthContext";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Navbar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const { user, isAuthenticated, logout } = useAuth();
  console.log("[Navbar] auth:", { user, isAuthenticated });

  // Mock cart data - replace with actual cart context/state
  const cartCount = 3; // TODO: connect to actual cart state

  const onSubmit = (e) => {
    e.preventDefault();
    const query = q.trim();
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
  };

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  // helper to show a short name in navbar
  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")?.[0] ||
    (user?.phone ? `User ${user.phone.slice(-4)}` : "Account");

  return (
    <nav className="navbar navbar-expand-lg navbar-blur sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="d-inline-flex align-items-center justify-content-center rounded-circle">
            <img
              src={logo}
              alt="Medi Suite"
              style={{
                width: 32,
                height: 32,
                objectFit: "contain",
              }}
            />
          </span>
          <span className="fw-semibold" style={{ letterSpacing: ".2px" }}>
            <span style={{ color: "var(--brand)" }}>Medi</span>
            <span style={{ color: "var(--accent)" }}>suite</span>
          </span>
          <span className="badge badge-soft ms-2 d-none d-md-inline">Skincare • Wellness</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMain"
          aria-controls="navMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navMain">
          <form className="d-lg-flex flex-grow-1 mx-lg-4 my-3 my-lg-0" onSubmit={onSubmit}>
            <div className="search-pill d-flex align-items-center px-3 py-2 w-100 bg-white">
              <i className="bi bi-search text-secondary me-2" />
              <input
                className="form-control border-0 p-0 shadow-none"
                placeholder="Search skincare, supplements, medicines..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button className="btn btn-brand btn-sm ms-2 d-none d-sm-inline" type="submit">
                Search
              </button>
            </div>
          </form>

          <ul className="navbar-nav align-items-lg-center gap-lg-2 ms-lg-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/products">
                Shop
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/brands">
                Brands
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contact">
                Contact
              </NavLink>
            </li>

            {/* Cart - Mobile */}
            <li className="nav-item d-lg-none">
              <NavLink className="nav-link" to="/cart">
                <i className="bi bi-bag me-2" />
                Cart
              </NavLink>
            </li>

            {/* Cart - Desktop with Badge */}
            <li className="nav-item ms-lg-2 d-none d-lg-inline">
              <Link 
                to="/cart" 
                className="btn btn-outline-secondary rounded-pill px-3 position-relative"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <i className="bi bi-bag" style={{ fontSize: "1.1rem" }} />
                Cart
                {cartCount > 0 && (
                  <span
                    className="position-absolute badge rounded-circle bg-danger"
                    style={{
                      top: "-8px",
                      right: "-8px",
                      width: "22px",
                      height: "22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: "600",
                      padding: "0",
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>

            {/* Auth Section */}
            <li className="nav-item ms-lg-2">
              {!isAuthenticated ? (
                <Link to="/login" className="btn btn-brand rounded-pill px-3">
                  <i className="bi bi-person me-2" />
                  Sign in
                </Link>
              ) : (
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary rounded-pill p-0 dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid rgba(15,23,42,.15)",
                    }}
                  >
                    <i className="bi bi-person-circle" style={{ fontSize: "1.3rem" }} />
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <div className="dropdown-item-text">
                        <div className="small text-secondary">Logged in as</div>
                        <div className="fw-semibold">{displayName}</div>
                      </div>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2" />
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/orders">
                        <i className="bi bi-receipt me-2" />
                        Orders
                      </Link>
                    </li>
                    <li className="d-lg-none">
                      <Link className="dropdown-item" to="/cart">
                        <i className="bi bi-bag me-2" />
                        Cart
                      </Link>
                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    <li>
                      <button className="dropdown-item text-danger" onClick={onLogout}>
                        <i className="bi bi-box-arrow-right me-2" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}