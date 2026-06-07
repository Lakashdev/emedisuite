import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import logo from "../../assets/logo.jpg";
import { useAuth } from "../../context/AuthContext";
import { CART_UPDATED_EVENT, getGuestCartCount } from "../../utils/cartEvents";
import 'bootstrap-icons/font/bootstrap-icons.css';

const API = import.meta.env.VITE_API_BASE_URL || "/api";

const SEARCH_ICONS = {
  product: "bi-capsule",
  brand: "bi-award",
  category: "bi-grid",
  page: "bi-compass",
};

export default function Navbar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [cartCount, setCartCount] = useState(0);
  const searchRef = useRef(null);

  const { user, isAuthenticated, token, logout } = useAuth();

  const onSubmit = (e) => {
    e.preventDefault();
    const query = q.trim();
    setSearchOpen(false);
    if (!query) {
      navigate("/products");
      return;
    }

    navigate(`/products?q=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    function closeSearch(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", closeSearch);
    return () => document.removeEventListener("mousedown", closeSearch);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCartCount() {
      if (!isAuthenticated) {
        setCartCount(getGuestCartCount());
        return;
      }

      try {
        const res = await fetch(`${API}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load cart count");

        const data = await res.json();
        const count = (data.cart?.items || []).reduce(
          (total, item) => total + Number(item.quantity || 0),
          0
        );
        if (!cancelled) setCartCount(count);
      } catch {
        if (!cancelled) setCartCount(0);
      }
    }

    loadCartCount();
    window.addEventListener(CART_UPDATED_EVENT, loadCartCount);
    window.addEventListener("storage", loadCartCount);

    return () => {
      cancelled = true;
      window.removeEventListener(CART_UPDATED_EVENT, loadCartCount);
      window.removeEventListener("storage", loadCartCount);
    };
  }, [isAuthenticated, token]);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${API}/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(res.ok ? data.items || [] : []);
        setActiveIndex(-1);
        setSearchOpen(true);
      } catch (error) {
        if (error.name === "AbortError") return;
        setResults([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  function selectResult(item) {
    setQ("");
    setSearchOpen(false);
    navigate(item.href);
  }

  function onSearchKeyDown(event) {
    if (event.key === "Escape") return setSearchOpen(false);
    if (!searchOpen || results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectResult(results[activeIndex]);
    }
  }

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
    <nav className="navbar navbar-expand-lg navbar-blur modern-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="d-inline-flex align-items-center justify-content-center rounded-circle">
            <img
              src={logo}
              alt="Medi Suite"
              className="brand-logo"
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
          <form ref={searchRef} className="d-lg-flex flex-grow-1 mx-lg-4 my-3 my-lg-0 position-relative" onSubmit={onSubmit}>
            <div className="search-pill d-flex align-items-center px-3 py-2 w-100 bg-white">
              <i className="bi bi-search text-secondary me-2" />
              <input
                className="form-control border-0 p-0 shadow-none"
                placeholder="Try skincare, protein powder, vitamin C..."
                aria-label="Search across Medisuite"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => q.trim().length >= 2 && setSearchOpen(true)}
                onKeyDown={onSearchKeyDown}
              />
              <button className="btn btn-brand btn-sm ms-2 d-none d-sm-inline" type="submit">
                Search
              </button>
            </div>
            {searchOpen && q.trim().length >= 2 && (
              <div className="nav-search-results">
                <div className="nav-search-heading">
                  <span>{searching ? "Finding matches..." : "Search Medisuite"}</span>
                  <small>Search by product, need, brand or category</small>
                </div>
                {!searching && (
                  <button className="nav-search-empty" type="submit">
                    <i className="bi bi-search" />
                    See all results for "{q.trim()}"
                  </button>
                )}
                {!searching && results.length === 0 ? (
                  <div className="nav-search-no-match">No close suggestions yet</div>
                ) : results.map((item, index) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    className={`nav-search-result ${activeIndex === index ? "active" : ""}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectResult(item)}
                  >
                    <span className={`nav-search-icon ${item.type}`}>
                      <i className={`bi ${SEARCH_ICONS[item.type] || "bi-search"}`} />
                    </span>
                    <span className="nav-search-copy">
                      <strong>{item.label}</strong>
                      <small>{item.meta}</small>
                    </span>
                    {item.price !== undefined && <span className="nav-search-price">NPR {Number(item.price).toLocaleString()}</span>}
                    <span className="nav-search-type">{item.type}</span>
                  </button>
                ))}
              </div>
            )}
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
                {cartCount > 0 && (
                  <span className="badge rounded-pill bg-danger ms-2">{cartCount}</span>
                )}
              </NavLink>
            </li>

            {/* Cart - Desktop with Badge */}
            <li className="nav-item ms-lg-2 d-none d-lg-inline">
              <Link 
                to="/cart" 
                className="btn nav-icon-btn rounded-pill px-3 position-relative"
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
                    className="btn nav-icon-btn rounded-pill p-0 dropdown-toggle"
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
