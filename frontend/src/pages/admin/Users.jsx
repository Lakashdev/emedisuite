import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/admin.api.js";
import Loader from "../../components/common/Loader.jsx";

const LIMIT = 20;

function money(value) {
  return `NPR ${Number(value || 0).toLocaleString("en-NP")}`;
}

function roleBadge(role) {
  if (role === "admin") return "danger";
  if (role === "cms_admin") return "warning";
  return "secondary";
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      setLoading(true);
      setError("");
      try {
        const params = { page, limit: LIMIT };
        if (search) params.search = search;
        if (role) params.role = role;

        const { data } = await adminApi.getUsers(params);
        if (ignore) return;
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        if (!ignore) setError(err.message || "Failed to load users");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      ignore = true;
    };
  }, [page, role, search]);

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setRole("");
    setPage(1);
  }

  return (
    <div>
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Users</h4>
          <div className="text-muted small">{total} registered accounts</div>
        </div>

        <form className="d-flex flex-wrap gap-2" onSubmit={handleSearch}>
          <input
            className="form-control form-control-sm"
            style={{ width: 240 }}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name, email, or phone"
          />
          <select
            className="form-select form-select-sm"
            style={{ width: 150 }}
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="cms_admin">CMS Admin</option>
          </select>
          <button className="btn btn-sm btn-primary" type="submit">Search</button>
          {(search || role) && (
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
          <div className="card shadow-sm border-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Email status</th>
                    <th>Orders</th>
                    <th>Total spent</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-5">No users found</td>
                    </tr>
                  ) : users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: 36, height: 36 }}
                          >
                            {(user.name?.[0] || "U").toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold">{user.name}</div>
                            <small className="text-muted">{user.id.slice(0, 10)}...</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{user.email || "No email"}</div>
                        <small className="text-muted">{user.phone || "No phone"}</small>
                      </td>
                      <td>
                        <span className={`badge text-bg-${roleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.emailVerified ? "text-bg-success" : "text-bg-light border text-secondary"}`}>
                          {user.email ? (user.emailVerified ? "Verified" : "Unverified") : "Not provided"}
                        </span>
                      </td>
                      <td>{user.orderCount}</td>
                      <td className="fw-semibold">{money(user.totalSpent)}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link className="btn btn-sm btn-outline-primary" to={`/admin/users/${user.id}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Prev
              </button>
              <span className="small text-muted">Page {page} of {totalPages}</span>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
