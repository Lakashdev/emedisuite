import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi } from "../../api/admin.api.js";
import Loader from "../../components/common/Loader.jsx";
import OrderStatusBadge from "../../components/common/OrderStatusBadge.jsx";

function money(value) {
  return `NPR ${Number(value || 0).toLocaleString("en-NP")}`;
}

function roleBadge(role) {
  if (role === "admin") return "danger";
  if (role === "cms_admin") return "warning";
  return "secondary";
}

function userToForm(user) {
  return {
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "customer",
  };
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "customer",
  });

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      setLoading(true);
      setError("");
      try {
        const { data } = await adminApi.getUser(id);
        if (!ignore) {
          setUser(data.user);
          setForm(userToForm(data.user));
        }
      } catch (err) {
        if (!ignore) setError(err.message || "Failed to load user");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadUser();
    return () => {
      ignore = true;
    };
  }, [id]);

  async function verifyEmail() {
    if (!user?.email || user.emailVerified || verifying) return;
    const confirmed = window.confirm(`Verify ${user.email} for this user?`);
    if (!confirmed) return;

    setVerifying(true);
    setError("");
    setNotice("");
    try {
      const { data } = await adminApi.verifyUserEmail(user.id);
      setUser((current) => ({ ...current, ...data.user, emailVerified: true }));
      setNotice(data.message || "User email verified successfully.");
    } catch (err) {
      setError(err.message || "Failed to verify user email");
    } finally {
      setVerifying(false);
    }
  }

  function startEditing() {
    setForm(userToForm(user));
    setError("");
    setNotice("");
    setEditing(true);
  }

  function cancelEditing() {
    setForm(userToForm(user));
    setEditing(false);
  }

  async function saveUser(event) {
    event.preventDefault();
    if (saving) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      role: form.role,
    };

    if (!payload.name) {
      setError("Name is required.");
      return;
    }
    if (!payload.email && !payload.phone) {
      setError("Email or phone is required.");
      return;
    }
    if (payload.email && !/^\S+@\S+\.\S+$/.test(payload.email)) {
      setError("Email address is invalid.");
      return;
    }
    if (payload.role !== user.role) {
      const confirmed = window.confirm(`Change this user's role from ${user.role} to ${payload.role}?`);
      if (!confirmed) return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const { data } = await adminApi.updateUser(user.id, payload);
      setUser((current) => ({ ...current, ...data.user }));
      setForm(userToForm(data.user));
      setEditing(false);
      setNotice(data.message || "User updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader />;
  if (error && !user) return <div className="alert alert-danger">{error}</div>;
  if (!user) return null;

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <Link to="/admin/users" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-left me-1" />Back
          </Link>
          <div>
            <h4 className="fw-bold mb-1">{user.name}</h4>
            <div className="text-muted small">User account details and order history</div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          {!editing && (
            <button className="btn btn-primary" onClick={startEditing}>
              <i className="bi bi-pencil-square me-2" />Edit user
            </button>
          )}
          {user.email && !user.emailVerified && !editing && (
            <button className="btn btn-success" onClick={verifyEmail} disabled={verifying}>
              <i className="bi bi-patch-check me-2" />
              {verifying ? "Verifying..." : "Verify user email"}
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold fs-4"
                  style={{ width: 58, height: 58 }}
                >
                  {(user.name?.[0] || "U").toUpperCase()}
                </div>
                <div>
                  <div className="h5 mb-1">{user.name}</div>
                  <span className={`badge text-bg-${roleBadge(user.role)}`}>{user.role}</span>
                </div>
              </div>

              {editing ? (
                <form onSubmit={saveUser}>
                  <div className="mb-3">
                    <label className="form-label">Full name</label>
                    <input
                      className="form-control"
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    />
                    <div className="form-text">Changing the email resets its verification status.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      value={form.phone}
                      onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={form.role}
                      onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                      <option value="cms_admin">CMS Admin</option>
                    </select>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary" type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                    <button className="btn btn-outline-secondary" type="button" onClick={cancelEditing} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <dl className="row mb-0">
                  <dt className="col-sm-4 text-muted">Email</dt>
                  <dd className="col-sm-8">
                    <div>{user.email || "Not provided"}</div>
                    {user.email && (
                      <span className={`badge mt-1 ${user.emailVerified ? "text-bg-success" : "text-bg-warning"}`}>
                        {user.emailVerified ? "Verified" : "Unverified"}
                      </span>
                    )}
                  </dd>
                  <dt className="col-sm-4 text-muted">Phone</dt>
                  <dd className="col-sm-8">{user.phone || "Not provided"}</dd>
                  <dt className="col-sm-4 text-muted">Joined</dt>
                  <dd className="col-sm-8">{new Date(user.createdAt).toLocaleString()}</dd>
                  <dt className="col-sm-4 text-muted">Updated</dt>
                  <dd className="col-sm-8 mb-0">{new Date(user.updatedAt).toLocaleString()}</dd>
                </dl>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="row g-3 h-100">
            <div className="col-12 col-sm-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="text-muted small">All orders</div>
                  <div className="h3 mb-0">{user.orderCount}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="text-muted small">Non-cancelled</div>
                  <div className="h3 mb-0">{user.completedOrderCount}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="text-muted small">Total spent</div>
                  <div className="h5 mb-0">{money(user.totalSpent)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white">
          <div className="fw-semibold">Orders</div>
          <div className="small text-muted">Complete order history for this user</div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Order</th>
                <th>Status</th>
                <th>Items</th>
                <th>Delivery city</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Placed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {user.orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-5">This user has no orders</td>
                </tr>
              ) : user.orders.map((order) => (
                <tr key={order.id}>
                  <td className="fw-semibold">{order.orderNumber}</td>
                  <td><OrderStatusBadge status={order.status} /></td>
                  <td>{order.items.length}</td>
                  <td>{order.city}</td>
                  <td>{order.paymentMethod}</td>
                  <td className="fw-semibold">{money(order.total)}</td>
                  <td>{new Date(order.placedAt).toLocaleDateString()}</td>
                  <td>
                    <Link className="btn btn-sm btn-outline-primary" to={`/admin/orders/${order.id}`}>
                      View order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
