import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import Loader from "../../components/common/Loader.jsx";

const STATUS_COLORS = {
  Placed: "warning",
  Confirmed: "info",
  Packed: "primary",
  OutForDelivery: "secondary",
  Delivered: "success",
  Cancelled: "danger",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/admin/orders", { params });
      setOrders(res.data.orders || res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0">Orders</h4>
        <select
          className="form-select form-select-sm w-auto"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {Object.keys(STATUS_COLORS).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading && <Loader />}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Placed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-muted py-4">No orders found</td></tr>
                ) : orders.map((order) => (
                  <tr key={order.id}>
                    <td><span className="fw-semibold">{order.orderNumber}</span></td>
                    <td>
                      <div>{order.fullName}</div>
                      <small className="text-muted">{order.phone}</small>
                    </td>
                    <td>NPR {order.total?.toLocaleString()}</td>
                    <td>
                      <span className={`badge bg-${STATUS_COLORS[order.status] || "secondary"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <small>{new Date(order.placedAt).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-2 align-items-center">
                        <Link className="btn btn-sm btn-outline-primary" to={`/admin/orders/${order.id}`}>
                          View
                        </Link>
                        <select
                          className="form-select form-select-sm"
                          style={{ width: "140px" }}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          {Object.keys(STATUS_COLORS).map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-3">
              <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                &laquo; Prev
              </button>
              <span className="align-self-center text-muted small">
                Page {page} of {totalPages}
              </span>
              <button className="btn btn-sm btn-outline-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Next &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
