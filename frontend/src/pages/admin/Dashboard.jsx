import { useEffect, useMemo, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useAuth } from "../../context/AuthContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

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

  const ordersLine = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.charts.labels,
      datasets: [
        {
          label: "Orders",
          data: data.charts.ordersSeries,
          tension: 0.3,
        },
      ],
    };
  }, [data]);

  const revenueBar = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.charts.labels,
      datasets: [
        {
          label: "Revenue",
          data: data.charts.revenueSeries,
        },
      ],
    };
  }, [data]);

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
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-muted small">Users</div>
                  <div className="h4 mb-0">{data.kpis.totalUsers}</div>
                  <div className="small text-muted mt-1">Registered customers</div>
                </div>
              </div>
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

          {/* Charts */}
    
        </>
      ) : null}
    </div>
  );
}