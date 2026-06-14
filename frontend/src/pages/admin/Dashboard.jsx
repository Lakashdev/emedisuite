import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "/api";

function money(n) {
  const x = Number(n || 0);
  return new Intl.NumberFormat("en-NP", { maximumFractionDigits: 0 }).format(x);
}

export default function Dashboard() {
  const { token } = useAuth();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const load = async (d = days) => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/admin/stats?days=${d}`, { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load dashboard");
      setData(json);
    } catch (e) {
      setErr(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-1">Dashboard</h4>
          <div className="text-muted small">
            Overview of orders, revenue, users, and top sales.
          </div>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <select
            className="form-select form-select-sm"
            style={{ width: 140 }}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            disabled={loading}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => load(days)}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {err ? <div className="alert alert-danger">{err}</div> : null}
      {loading ? <div className="card p-4">Loading…</div> : null}

      {!loading && data ? (
        <>
          {/* KPI cards */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-muted small">Total Revenue</div>
                  <div className="h4 mb-0">Rs {money(data.kpis.totalRevenue)}</div>
                  <div className="small text-muted mt-1">
                    Avg order: Rs {money(data.kpis.avgOrderValue)}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-muted small">Orders</div>
                  <div className="h4 mb-0">{data.kpis.totalOrders}</div>
                  <div className="small text-muted mt-1">
                    Paid: {data.kpis.paidOrders}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <Link to="/admin/users" className="card shadow-sm text-decoration-none text-dark h-100">
                <div className="card-body">
                  <div className="text-muted small">Users</div>
                  <div className="h4 mb-0">{data.kpis.totalUsers}</div>
                  <div className="small text-primary mt-1">View registered users</div>
                </div>
              </Link>
            </div>

            <div className="col-12 col-md-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-muted small">Products</div>
                  <div className="h4 mb-0">{data.kpis.totalProducts}</div>
                  <div className="small text-muted mt-1">Active catalogue</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm mb-3">
            <div className="card-header bg-white d-flex align-items-center justify-content-between">
              <div>
                <div className="fw-semibold">Recent users</div>
                <div className="small text-muted">Latest registered accounts</div>
              </div>
              <Link to="/admin/users" className="btn btn-sm btn-outline-primary">
                Manage users
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Orders</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.recentUsers || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">No users found</td>
                    </tr>
                  ) : data.recentUsers.map((recentUser) => (
                    <tr key={recentUser.id}>
                      <td className="fw-semibold">{recentUser.name}</td>
                      <td>
                        <div>{recentUser.email || "No email"}</div>
                        <small className="text-muted">{recentUser.phone || "No phone"}</small>
                      </td>
                      <td><span className="badge text-bg-secondary">{recentUser.role}</span></td>
                      <td>
                        <span className={`badge ${recentUser.emailVerified ? "text-bg-success" : "text-bg-light border text-secondary"}`}>
                          {recentUser.email ? (recentUser.emailVerified ? "Verified" : "Unverified") : "Not provided"}
                        </span>
                      </td>
                      <td>{recentUser.orderCount}</td>
                      <td>{new Date(recentUser.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
    
        </>
      ) : null}
    </div>
  );
}
