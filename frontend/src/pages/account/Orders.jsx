import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import OrderStatusBadge from "../../components/common/OrderStatusBadge";

const API = "http://localhost:5000";

const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-US")}`;
const fmt = (d) => (d ? new Date(d).toLocaleString() : "-");

export default function Orders() {
  const { token } = useAuth();
  const nav = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setErr("");
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/orders/my`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load orders");

        if (!ignore) setOrders(data.items || []);
      } catch (e) {
        if (!ignore) setErr(e.message || "Error");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => (ignore = true);
  }, [headers]);

  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const cancelled = orders.filter((o) => o.status === "Cancelled").length;
    const totalSpent = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return { totalOrders, delivered, cancelled, totalSpent };
  }, [orders]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return orders.filter((o) => {
      const matchQ = !query || String(o.orderNumber || "").toLowerCase().includes(query);
      const matchStatus = status === "all" || o.status === status;
      return matchQ && matchStatus;
    });
  }, [orders, q, status]);

  const reorder = async (orderId) => {
    setErr("");
    setToast("");
    try {
      const res = await fetch(`${API}/api/cart/reorder/${orderId}`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reorder failed");

      setToast("Items added to cart");
      nav("/cart");
    } catch (e) {
      setErr(e.message || "Reorder failed");
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
        <div>
          <h2 className="fw-bold mb-1">My Orders</h2>
          <div className="text-secondary">View details, track status, and reorder in one click.</div>
        </div>

        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to="/profile">
            Account
          </Link>
          <Link className="btn btn-brand" to="/products">
            Continue shopping
          </Link>
        </div>
      </div>

      {toast ? <div className="alert alert-success">{toast}</div> : null}
      {err ? <div className="alert alert-danger">{err}</div> : null}

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="card card-soft p-3 h-100">
            <div className="text-secondary small">Total Orders</div>
            <div className="fs-3 fw-bold">{summary.totalOrders}</div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card card-soft p-3 h-100">
            <div className="text-secondary small">Delivered</div>
            <div className="fs-3 fw-bold">{summary.delivered}</div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card card-soft p-3 h-100">
            <div className="text-secondary small">Cancelled</div>
            <div className="fs-3 fw-bold">{summary.cancelled}</div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card card-soft p-3 h-100">
            <div className="text-secondary small">Total Spent</div>
            <div className="fs-4 fw-bold">{money(summary.totalSpent)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-soft p-3 p-md-4 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-7">
            <div className="search-pill d-flex align-items-center px-3 py-2 bg-white">
              <i className="bi bi-search text-secondary me-2" />
              <input
                className="form-control border-0 p-0 shadow-none"
                placeholder="Search by order number (e.g., ORD-2026...)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-5 d-flex gap-2 justify-content-md-end">
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Placed">Placed</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Packed">Packed</option>
              <option value="OutForDelivery">OutForDelivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="card card-soft p-3 p-md-4">
        {loading ? (
          <div className="text-secondary py-4">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="text-secondary py-4">
            No matching orders.{" "}
            <Link to="/products" style={{ color: "var(--brand)" }}>
              Shop now
            </Link>
            .
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr className="text-secondary small">
                  <th>Order</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end">Total</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td className="fw-semibold">#{o.orderNumber}</td>
                    <td>{fmt(o.placedAt || o.createdAt)}</td>
                    <td><OrderStatusBadge status={o.status} /></td>
                    <td className="text-end">{money(o.total)}</td>
                    <td className="text-end">
                      <Link className="btn btn-outline-secondary btn-sm me-2" to={`/orders/${o.id}`}>
                        View
                      </Link>
                      <button className="btn btn-outline-primary btn-sm" onClick={() => reorder(o.id)}>
                        Reorder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
