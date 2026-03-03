import { useEffect, useMemo, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API = "http://localhost:5000";

function money(n) {
  const v = Number(n || 0);
  return `Rs. ${v.toLocaleString("en-US")}`;
}

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString();
}

export default function Profile() {
  const { token, user, setUser, authFetch } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [showVerify, setShowVerify] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  useEffect(() => {
    let ignore = false;

    async function loadAll() {
      setErr("");
      setOk("");
      setLoading(true);

      try {
        // Load profile + dashboard data in parallel
        const [meRes, sumRes, ordRes, prodRes] = await Promise.all([
          authFetch(`${API}/api/profile/me`, { headers: { Authorization: `Bearer ${token}` } }),
          authFetch(`${API}/api/profile/summary`, { headers: { Authorization: `Bearer ${token}` } }),
          authFetch(`${API}/api/profile/recent-orders?limit=5`, { headers: { Authorization: `Bearer ${token}` } }),
          authFetch(`${API}/api/profile/recent-products?limit=8`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const me = await meRes.json();
        const sum = await sumRes.json();
        const ord = await ordRes.json();
        const prod = await prodRes.json();

        if (!meRes.ok) throw new Error(me.message || "Failed to load profile");
        // If summary/orders/products endpoints not added yet, don't hard-fail the page:
        const summaryOk = sumRes.ok ? sum.summary : null;
        const ordersOk = ordRes.ok ? ord.orders : [];
        const productsOk = prodRes.ok ? prod.products : [];

        if (ignore) return;

        setProfileForm({
          name: me.user?.name || "",
          email: me.user?.email || "",
          phone: me.user?.phone || "",
        });

        setUser(me.user);
        setSummary(summaryOk);
        setRecentOrders(Array.isArray(ordersOk) ? ordersOk : []);
        setRecentProducts(Array.isArray(productsOk) ? productsOk : []);
      } catch (e) {
        if (!ignore) setErr(e.message || "Something went wrong");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadAll();
    return () => {
      ignore = true;
    };
  }, [token, setUser]);

  const setField = (k, v) => setProfileForm((s) => ({ ...s, [k]: v }));

  const onSaveProfile = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!profileForm.name.trim()) return setErr("Name is required");

    setSaving(true);
    try {
      const res = await authFetch(`${API}/api/profile/me`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          name: profileForm.name.trim(),
          email: profileForm.email.trim() || null,
          phone: profileForm.phone.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setOk("Profile updated successfully");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (e) {
      setErr(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const onVerifyEmail = async () => {
    setVerifyMsg("");
    if (!/^\d{6}$/.test(code)) {
      setVerifyMsg("Enter a valid 6-digit code");
      return;
    }

    setVerifying(true);
    try {
      const res = await authFetch(`${API}/api/auth/verify-email`, {
        method: "POST",
        headers,
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      const updated = { ...user, emailVerified: true };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));

      setVerifyMsg("Email verified successfully ✅");
      setShowVerify(false);
      setCode("");
    } catch (e) {
      setVerifyMsg(e.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const onResendCode = async () => {
    setVerifyMsg("");
    setResending(true);
    try {
      const res = await authFetch(`${API}/api/auth/resend-email-code`, {
        method: "POST",
        headers,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Resend failed");

      setVerifyMsg("A new code has been sent to your email.");
    } catch (e) {
      setVerifyMsg(e.message || "Resend failed");
    } finally {
      setResending(false);
    }
  };

  if (!token) {
    return <div className="container py-5">Please login again.</div>;
  }
  if (loading) return <div className="container py-5">Loading account…</div>;

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
        <div>
          <h2 className="fw-bold mb-1">My Account</h2>
          <div className="text-secondary">
            Welcome back, <span className="fw-semibold">{user?.name}</span>
          </div>
        </div>

        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to="/orders">
            View all orders
          </Link>
          <Link className="btn btn-brand" to="/products">
            Continue shopping
          </Link>
        </div>
      </div>

      {err ? <div className="alert alert-danger">{err}</div> : null}
      {ok ? <div className="alert alert-success">{ok}</div> : null}

      {user?.email && !user?.emailVerified ? (
        <div className="alert alert-warning d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <div className="fw-semibold">Verify your email</div>
            <div className="small text-secondary">
              For account security and password recovery, please verify your email address.
            </div>
          </div>

          <button className="btn btn-brand btn-sm" onClick={() => setShowVerify(true)}>
            Verify email
          </button>
        </div>
      ) : null}

      {/* KPI cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="card card-soft p-3 h-100">
            <div className="text-secondary small">Total Orders</div>
            <div className="fs-3 fw-bold">{summary?.totalOrders ?? "-"}</div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card card-soft p-3 h-100">
            <div className="text-secondary small">Delivered</div>
            <div className="fs-3 fw-bold">{summary?.deliveredOrders ?? "-"}</div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card card-soft p-3 h-100">
            <div className="text-secondary small">Total Spent</div>
            <div className="fs-4 fw-bold">{summary ? money(summary.totalSpent) : "-"}</div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card card-soft p-3 h-100">
            <div className="text-secondary small">Last Order</div>
            <div className="fw-semibold">
              {summary?.lastOrder?.orderNumber ? `#${summary.lastOrder.orderNumber}` : "-"}
            </div>
            <div className="text-secondary small">{fmtDate(summary?.lastOrder?.placedAt)}</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent orders */}
        <div className="col-12 col-lg-7">
          <div className="card card-soft p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="fw-bold mb-0">Recent Orders</h5>
              <Link to="/orders" className="small" style={{ color: "var(--brand)" }}>
                See all
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-secondary">No orders yet. Start shopping!</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr className="text-secondary small">
                      <th>Order</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="fw-semibold">#{o.orderNumber}</td>
                        <td>{fmtDate(o.placedAt)}</td>
                        <td>
                          <span className="badge bg-light text-dark border">{o.status}</span>
                        </td>
                        <td className="text-end">{money(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Edit profile */}
          <div className="card card-soft p-4 mt-4">
            <h5 className="fw-bold mb-3">Profile Details</h5>

            <form onSubmit={onSaveProfile} className="row g-3">
              <div className="col-12">
                <label className="form-label">Full name</label>
                <input
                  className="form-control"
                  value={profileForm.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  value={profileForm.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Phone</label>
                <input
                  className="form-control"
                  value={profileForm.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="98XXXXXXXX"
                />
              </div>

              <div className="col-12 d-flex align-items-center">
                <button className="btn btn-brand" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <div className="ms-auto text-secondary small">
                  Member since {fmtDate(user?.createdAt)}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Previously purchased */}
        <div className="col-12 col-lg-5">
          <div className="card card-soft p-4">
            <h5 className="fw-bold mb-2">Previously Purchased</h5>
            <div className="text-secondary small mb-3">
              Quickly reorder items you bought before.
            </div>

            {recentProducts.length === 0 ? (
              <div className="text-secondary">No purchase history yet.</div>
            ) : (
              <div className="row g-3">
                {recentProducts.map((p) => (
                  <div className="col-12" key={p.productId}>
                    <div className="d-flex gap-3 align-items-center border rounded-4 p-3">
                      <div
                        className="rounded-3"
                        style={{
                          width: 56,
                          height: 56,
                          background: "rgba(15,23,42,.06)",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {p.image ? (
                          <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span className="text-secondary small">No image</span>
                        )}
                      </div>

                      <div className="flex-grow-1">
                        <div className="fw-semibold">{p.name}</div>
                        <div className="text-secondary small">{money(p.price)}</div>
                      </div>

                      <Link to={p.slug ? `/products/${p.slug}` : "/products"} className="btn btn-outline-secondary btn-sm">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3">
              <Link to="/products" className="btn btn-outline-secondary w-100">
                Browse products
              </Link>
            </div>
          </div>

          {/* Small quick actions */}
          <div className="card card-soft p-4 mt-4">
            <h6 className="fw-bold mb-2">Quick Actions</h6>
            <div className="d-grid gap-2">
              <Link to="/cart" className="btn btn-outline-secondary">
                Go to cart
              </Link>
              <Link to="/checkout" className="btn btn-outline-secondary">
                Checkout
              </Link>
              <Link to="/orders" className="btn btn-outline-secondary">
                Track orders
              </Link>
            </div>
          </div>
        </div>
      </div>
      {showVerify ? (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,.45)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content rounded-4">
              <div className="modal-header">
                <h5 className="modal-title">Verify email</h5>
                <button type="button" className="btn-close" onClick={() => setShowVerify(false)} />
              </div>

              <div className="modal-body">
                <div className="text-secondary small mb-2">
                  Enter the 6-digit code sent to <span className="fw-semibold">{user?.email}</span>
                </div>

                <input
                  className="form-control"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                />

                {verifyMsg ? <div className="small mt-2">{verifyMsg}</div> : null}
              </div>

              <div className="modal-footer d-flex justify-content-between">
                <button className="btn btn-outline-secondary" onClick={onResendCode} disabled={resending}>
                  {resending ? "Sending..." : "Resend code"}
                </button>

                <button className="btn btn-brand" onClick={onVerifyEmail} disabled={verifying}>
                  {verifying ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
