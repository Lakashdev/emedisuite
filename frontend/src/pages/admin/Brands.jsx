import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "/api";

export default function Brands() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // form/modal state
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const emptyForm = useMemo(
    () => ({ id: null, name: "", slug: "", logoUrl: "", status: "active" }),
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
      const res = await fetch(`${API_BASE}/brands`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      setErr("Failed to load brands");
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

  const openEdit = (b) => {
    setForm({
      id: b.id,
      name: b.name || "",
      slug: b.slug || "",
      logoUrl: b.logoUrl || "",
      status: b.status || "active",
    });
    setErr("");
    setShowForm(true);
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.slug.trim()) return "Slug is required";
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
        logoUrl: form.logoUrl.trim() || null,
        status: form.status,
      };

      const url = isEdit
        ? `${API_BASE}/brands/${form.id}`
        : `${API_BASE}/brands`;

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

  const remove = async (brand) => {
    const ok = window.confirm(`Delete brand "${brand.name}"?`);
    if (!ok) return;

    setErr("");
    try {
      const res = await fetch(`${API_BASE}/brands/${brand.id}`, {
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
          <h4 className="mb-1">Brands</h4>
          <div className="text-muted small">
            Create and manage product brands.
          </div>
        </div>

        <button className="btn btn-primary" onClick={openCreate}>
          + Add Brand
        </button>
      </div>

      {err ? <div className="alert alert-danger">{err}</div> : null}

      {/* List */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4">Loading…</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 70 }}>Logo</th>
                    <th>Name</th>
                    <th className="text-muted">Slug</th>
                    <th style={{ width: 120 }}>Status</th>
                    <th className="text-end" style={{ width: 180 }}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((b) => (
                    <tr key={b.id}>
                      <td>
                        {b.logoUrl ? (
                          <img
                            src={b.logoUrl}
                            alt={b.name}
                            style={{
                              width: 42,
                              height: 42,
                              objectFit: "cover",
                              borderRadius: 10,
                              border: "1px solid rgba(0,0,0,.08)",
                            }}
                          />
                        ) : (
                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 10,
                              background: "rgba(0,0,0,.04)",
                              border: "1px solid rgba(0,0,0,.08)",
                              fontWeight: 700,
                            }}
                          >
                            {(b.name?.[0] || "B").toUpperCase()}
                          </div>
                        )}
                      </td>

                      <td className="fw-semibold">{b.name}</td>
                      <td className="text-muted">{b.slug}</td>

                      <td>
                        <span
                          className={`badge ${
                            b.status === "active"
                              ? "text-bg-success"
                              : "text-bg-secondary"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => openEdit(b)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => remove(b)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!items.length && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-5">
                        No brands yet. Click <b>Add Brand</b>.
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
            // close when clicking backdrop
            if (e.target.classList.contains("modal")) setShowForm(false);
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content">
              <form onSubmit={save}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {form.id ? "Edit Brand" : "Add Brand"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowForm(false)}
                  />
                </div>

                <div className="modal-body">
                  {err ? <div className="alert alert-danger">{err}</div> : null}

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Name *</label>
                      <input
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        placeholder="e.g. Himalaya"
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Slug *</label>
                      <input
                        className="form-control"
                        value={form.slug}
                        onChange={(e) => setField("slug", e.target.value)}
                        placeholder="e.g. himalaya"
                      />
                      <div className="form-text">
                        Use lowercase and hyphens (e.g. <code>my-brand</code>)
                      </div>
                    </div>

                    <div className="col-12 col-md-8">
                      <label className="form-label">Logo URL</label>
                      <input
                        className="form-control"
                        value={form.logoUrl}
                        onChange={(e) => setField("logoUrl", e.target.value)}
                        placeholder="https://…"
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={form.status}
                        onChange={(e) => setField("status", e.target.value)}
                      >
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                      </select>
                    </div>

                    {form.logoUrl ? (
                      <div className="col-12">
                        <label className="form-label">Preview</label>
                        <div>
                          <img
                            src={form.logoUrl}
                            alt="preview"
                            style={{
                              width: 84,
                              height: 84,
                              objectFit: "cover",
                              borderRadius: 14,
                              border: "1px solid rgba(0,0,0,.08)",
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowForm(false)}
                    disabled={saving}
                  >
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