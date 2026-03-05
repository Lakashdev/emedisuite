import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "/api";

const toSlug = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function readResponse(res) {
  const text = await res.text();
  const ct = res.headers.get("content-type") || "";
  const looksJson = ct.includes("application/json") || text.trim().startsWith("{") || text.trim().startsWith("[");
  if (looksJson && text) {
    try {
      return { ok: res.ok, status: res.status, data: JSON.parse(text), rawText: text };
    } catch {
      // fallthrough
    }
  }
  return { ok: res.ok, status: res.status, data: null, rawText: text };
}

function buildErrorMessage(out, fallback = "Request failed") {
  const msg = out?.data?.message || out?.data?.error;
  if (msg) return msg;

  const raw = (out?.rawText || "").trim();
  if (raw.startsWith("<!DOCTYPE") || raw.startsWith("<html")) {
    return `Server returned HTML instead of JSON (status ${out.status}). Check backend route/proxy.`;
  }
  if (raw) return raw.length > 200 ? raw.slice(0, 200) + "…" : raw;

  return `${fallback} (status ${out?.status || "?"})`;
}

export default function Brands() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal/form state
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // brand logo file
  const [logoFile, setLogoFile] = useState(null);

  // expanded products per brand
  const [expandedId, setExpandedId] = useState(null);
  const [brandProducts, setBrandProducts] = useState({}); // { [brandId]: {loading, items, error} }

  const emptyForm = useMemo(() => ({ id: null, name: "", slug: "", status: "active" }), []);
  const [form, setForm] = useState(emptyForm);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const ensureAuth = () => {
    if (!token) {
      setErr("You are not logged in. Please log in again.");
      return false;
    }
    return true;
  };

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/brands`);
      const out = await readResponse(res);
      if (!out.ok) throw new Error(buildErrorMessage(out, "Failed to load brands"));
      setItems(out.data?.items || []);
    } catch (e) {
      setErr(e.message || "Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setLogoFile(null);
    setErr("");
    setShowForm(true);
  };

  const openEdit = (b) => {
    setForm({
      id: b.id,
      name: b.name || "",
      slug: b.slug || "",
      status: b.status || "active",
    });
    setLogoFile(null); // optional: only upload if you want to replace
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

    if (!ensureAuth()) return;

    const msg = validate();
    if (msg) return setErr(msg);

    setSaving(true);
    try {
      const isEdit = !!form.id;

      // multipart FormData (supports file)
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("slug", form.slug.trim());
      fd.append("status", form.status);

      if (logoFile) fd.append("logo", logoFile);

      const url = isEdit ? `${API_BASE}/brands/${form.id}` : `${API_BASE}/brands`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` }, // DO NOT set content-type for FormData
        body: fd,
      });

      const out = await readResponse(res);
      if (!out.ok) {
        if (out.status === 409) throw new Error(out.data?.message || "Slug already exists");
        throw new Error(buildErrorMessage(out, "Save failed"));
      }

      setShowForm(false);
      setLogoFile(null);
      await load();
    } catch (e2) {
      setErr(e2.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (brand) => {
    if (!ensureAuth()) return;

    const ok = window.confirm(`Delete brand "${brand.name}"?`);
    if (!ok) return;

    setErr("");
    try {
      const res = await fetch(`${API_BASE}/brands/${brand.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const out = await readResponse(res);
      if (!out.ok) throw new Error(buildErrorMessage(out, "Delete failed"));

      await load();
    } catch (e) {
      setErr(e.message || "Delete failed");
    }
  };

  const toggleProducts = async (brandId) => {
    if (expandedId === brandId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(brandId);

    // already loaded
    if (brandProducts[brandId]?.items?.length) return;

    setBrandProducts((s) => ({
      ...s,
      [brandId]: { loading: true, items: [], error: "" },
    }));

    try {
      const params = new URLSearchParams({ brandId, page: "1", limit: "50" });
      const res = await fetch(`${API_BASE}/products?${params.toString()}`);
      const out = await readResponse(res);
      if (!out.ok) throw new Error(buildErrorMessage(out, "Failed to load products for brand"));

      setBrandProducts((s) => ({
        ...s,
        [brandId]: { loading: false, items: out.data?.items || [], error: "" },
      }));
    } catch (e) {
      setBrandProducts((s) => ({
        ...s,
        [brandId]: { loading: false, items: [], error: e.message || "Failed to load products" },
      }));
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-1">Brands</h4>
          <div className="text-muted small">Create and manage product brands.</div>
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
                    <th style={{ width: 56 }}>Logo</th>
                    <th>Name</th>
                    <th className="text-muted">Slug</th>
                    <th style={{ width: 120 }}>Status</th>
                    <th className="text-end" style={{ width: 260 }}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((b) => (
                    <>
                      <tr key={b.id}>
                        <td>
                          {b.logoUrl ? (
                            <img
                              src={b.logoUrl}
                              alt={b.name}
                              style={{
                                width: 34,
                                height: 34,
                                objectFit: "cover",
                                borderRadius: 10,
                                border: "1px solid rgba(0,0,0,.08)",
                              }}
                            />
                          ) : (
                            <div
                              className="d-flex align-items-center justify-content-center"
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 10,
                                background: "rgba(0,0,0,.04)",
                                border: "1px solid rgba(0,0,0,.08)",
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              {(b.name?.[0] || "B").toUpperCase()}
                            </div>
                          )}
                        </td>

                        <td className="fw-semibold">
                          {b.name}
                          <div className="text-muted small">
                            <button
                              type="button"
                              className="btn btn-link p-0"
                              onClick={() => toggleProducts(b.id)}
                            >
                              {expandedId === b.id ? "Hide products" : "View products"}
                            </button>
                          </div>
                        </td>

                        <td className="text-muted">{b.slug}</td>

                        <td>
                          <span className={`badge ${b.status === "active" ? "text-bg-success" : "text-bg-secondary"}`}>
                            {b.status}
                          </span>
                        </td>

                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEdit(b)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-outline-danger me-2" onClick={() => remove(b)}>
                            Delete
                          </button>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => toggleProducts(b.id)}>
                            {expandedId === b.id ? "▲ Products" : "▼ Products"}
                          </button>
                        </td>
                      </tr>

                      {expandedId === b.id ? (
                        <tr key={`${b.id}-products`}>
                          <td colSpan={5} className="bg-light">
                            <div className="p-3">
                              <div className="fw-semibold mb-2">Products under “{b.name}”</div>

                              {brandProducts[b.id]?.loading ? (
                                <div className="text-muted">Loading products…</div>
                              ) : brandProducts[b.id]?.error ? (
                                <div className="text-danger">{brandProducts[b.id].error}</div>
                              ) : (
                                <>
                                  {!brandProducts[b.id]?.items?.length ? (
                                    <div className="text-muted">No products found for this brand.</div>
                                  ) : (
                                    <div className="table-responsive">
                                      <table className="table table-sm align-middle mb-0">
                                        <thead>
                                          <tr>
                                            <th>Name</th>
                                            <th className="text-muted">Slug</th>
                                            <th className="text-end">Price</th>
                                            <th className="text-end">Stock</th>
                                            <th>Status</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {brandProducts[b.id].items.map((p) => (
                                            <tr key={p.id}>
                                              <td className="fw-semibold">{p.name}</td>
                                              <td className="text-muted">{p.slug}</td>
                                              <td className="text-end">{p.basePrice}</td>
                                              <td className="text-end">{p.baseStock}</td>
                                              <td>
                                                <span className={`badge ${p.status === "active" ? "text-bg-success" : "text-bg-secondary"}`}>
                                                  {p.status}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </>
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
            if (e.target.classList.contains("modal")) setShowForm(false);
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content">
              <form onSubmit={save}>
                <div className="modal-header">
                  <h5 className="modal-title">{form.id ? "Edit Brand" : "Add Brand"}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
                </div>

                <div className="modal-body">
                  {err ? <div className="alert alert-danger">{err}</div> : null}

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Name *</label>
                      <input
                        className="form-control"
                        value={form.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setField("name", val);
                          if (!form.id) setField("slug", toSlug(val)); // auto slug on create
                        }}
                        placeholder="e.g. Himalaya"
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Slug *</label>
                      <input className="form-control" value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="e.g. himalaya" />
                      <div className="form-text">Use lowercase and hyphens (e.g. <code>my-brand</code>)</div>
                    </div>

                    <div className="col-12 col-md-8">
                      <label className="form-label">Brand Logo</label>
                      <input type="file" className="form-control" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                      <div className="form-text">Upload a logo image (max ~2MB recommended).</div>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={form.status} onChange={(e) => setField("status", e.target.value)}>
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                      </select>
                    </div>

                    {logoFile ? (
                      <div className="col-12">
                        <label className="form-label">Preview</label>
                        <div>
                          <img
                            src={URL.createObjectURL(logoFile)}
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