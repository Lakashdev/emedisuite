import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "/api";

export default function Categories() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const emptyForm = useMemo(
    () => ({ id: null, name: "", slug: "", parentId: "", status: "active" }),
    []
  );
  const [form, setForm] = useState(emptyForm);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setErr("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setErr("");
    setShowForm(true);
  };

  const openEdit = (c) => {
    setForm({
      id: c.id,
      name: c.name || "",
      slug: c.slug || "",
      parentId: c.parentId || "",
      status: c.status || "active",
    });
    setErr("");
    setShowForm(true);
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.slug.trim()) return "Slug is required";
    if (form.id && form.parentId === form.id) return "Category cannot be its own parent";
    return "";
  };

  const save = async (e) => {
    e.preventDefault();
    setErr("");

    const msg = validate();
    if (msg) return setErr(msg);

    setSaving(true);
    try {
      const isEdit = !!form.id;

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        parentId: form.parentId ? form.parentId : null,
        status: form.status,
      };

      const url = isEdit
        ? `${API_BASE}/categories/${form.id}`
        : `${API_BASE}/categories`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");

      setShowForm(false);
      await load();
    } catch (e) {
      setErr(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    const ok = window.confirm(`Delete category "${c.name}"?`);
    if (!ok) return;

    setErr("");
    try {
      const res = await fetch(`${API_BASE}/categories/${c.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      await load();
    } catch (e) {
      setErr(e.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-1">Categories</h4>
          <div className="text-muted small">Manage product categories and parent-child structure.</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Category
        </button>
      </div>

      {err ? <div className="alert alert-danger">{err}</div> : null}

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4">Loading…</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th className="text-muted">Slug</th>
                    <th>Parent</th>
                    <th style={{ width: 120 }}>Status</th>
                    <th className="text-end" style={{ width: 180 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-semibold">{c.name}</td>
                      <td className="text-muted">{c.slug}</td>
                      <td>{c.parent?.name || <span className="text-muted">—</span>}</td>
                      <td>
                        <span className={`badge ${c.status === "active" ? "text-bg-success" : "text-bg-secondary"}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEdit(c)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove(c)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!items.length && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-5">
                        No categories yet. Click <b>Add Category</b>.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm ? (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ background: "rgba(0,0,0,.45)" }}
          onMouseDown={(e) => {
            if (e.target.classList.contains("modal")) setShowForm(false);
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content">
              <form onSubmit={save}>
                <div className="modal-header">
                  <h5 className="modal-title">{form.id ? "Edit Category" : "Add Category"}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
                </div>

                <div className="modal-body">
                  {err ? <div className="alert alert-danger">{err}</div> : null}

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Name *</label>
                      <input className="form-control" value={form.name} onChange={(e) => setField("name", e.target.value)} />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Slug *</label>
                      <input className="form-control" value={form.slug} onChange={(e) => setField("slug", e.target.value)} />
                    </div>

                    <div className="col-12 col-md-8">
                      <label className="form-label">Parent Category</label>
                      <select
                        className="form-select"
                        value={form.parentId}
                        onChange={(e) => setField("parentId", e.target.value)}
                      >
                        <option value="">(No parent)</option>
                        {items
                          .filter((x) => x.id !== form.id) // can’t pick itself
                          .map((x) => (
                            <option key={x.id} value={x.id}>
                              {x.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={form.status} onChange={(e) => setField("status", e.target.value)}>
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}