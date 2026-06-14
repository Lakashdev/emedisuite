import { useCallback, useEffect, useState } from "react";
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
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.get("/admin/orders", { params });
      setOrders(res.data.orders || res.data.items || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || Math.max(1, Math.ceil((res.data.total || 0) / LIMIT)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function handleStatusChange(orderId, newStatus) {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStatusFilter("");
    setPage(1);
  }

  return (
    <div>
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Orders</h4>
          <div className="text-muted small">{total} matching orders</div>
        </div>

        <form className="d-flex flex-wrap gap-2" onSubmit={handleSearch}>
          <input
            className="form-control form-control-sm"
            style={{ width: 270 }}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Order #, customer, email, or phone"
          />
          <select
            className="form-select form-select-sm"
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {Object.keys(STATUS_COLORS).map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button className="btn btn-sm btn-primary" type="submit">
            <i className="bi bi-search me-1" />Search
          </button>
          {(search || statusFilter) && (
            <button className="btn btn-sm btn-outline-secondary" type="button" onClick={clearFilters}>
              Clear
            </button>
          )}
        </form>
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
                      <small className="text-muted d-block">{order.phone}</small>
                      {order.user?.email && <small className="text-muted">{order.user.email}</small>}
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
              <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                &laquo; Prev
              </button>
              <span className="align-self-center text-muted small">
                Page {page} of {totalPages}
              </span>
              <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                Next &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
