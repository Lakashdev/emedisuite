import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "/api";

export default function Products() {
  const { token } = useAuth();

  // lookups
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // filters
  const [q, setQ] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");

  // list
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 12;
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // modal/form
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const emptyForm = useMemo(
    () => ({
      id: null,
      name: "",
      slug: "",
      description: "",
      brandId: "",
      categoryId: "",
      basePrice: "",
      baseStock: "",
      status: "active",
      featured: false,
      prescriptionRequired: false,
      discountType: "",
      discountValue: "",
      discountStartAt: "",
      discountEndAt: "",
      imagesText: "", // comma/newline URLs
      variants: [], // {name, sku, price, stock}
    }),
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

  const loadLookups = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/brands`),
        fetch(`${API_BASE}/categories`),
      ]);
      const [bData, cData] = await Promise.all([bRes.json(), cRes.json()]);
      setBrands(bData.items || []);
      setCategories(cData.items || []);
    } catch {
      // optional
    }
  };

  const load = async (nextPage = page) => {
    setErr("");
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (brandId) params.set("brandId", brandId);
      if (categoryId) params.set("categoryId", categoryId);
      if (status) params.set("status", status);
      params.set("page", String(nextPage));
      params.set("limit", String(limit));

      const res = await fetch(`${API_BASE}/products?${params.toString()}`);
      const data = await res.json();

      setItems(data.items || []);
      setPage(data.page || nextPage);
      setTotalPages(data.totalPages || 1);
    } catch {
      setErr("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLookups();
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => load(1);

  const openCreate = () => {
    setForm(emptyForm);
    setErr("");
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      id: p.id,
      name: p.name || "",
      slug: p.slug || "",
      description: p.description || "",
      brandId: p.brandId || "",
      categoryId: p.categoryId || "",
      basePrice: p.basePrice ?? "",
      baseStock: p.baseStock ?? "",
      status: p.status || "active",
      featured: !!p.featured,
      prescriptionRequired: !!p.prescriptionRequired,
      discountType: p.discountType || "",
      discountValue: p.discountValue ?? "",
      discountStartAt: p.discountStartAt ? String(p.discountStartAt).slice(0, 16) : "",
      discountEndAt: p.discountEndAt ? String(p.discountEndAt).slice(0, 16) : "",
      imagesText: (p.images || []).map((x) => x.url).join("\n"),
      variants: (p.variants || []).map((v) => ({
        name: v.name || "",
        sku: v.sku || "",
        price: v.price ?? "",
        stock: v.stock ?? "",
      })),
    });
    setErr("");
    setShowForm(true);
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.slug.trim()) return "Slug is required";
    if (!form.brandId) return "Brand is required";
    if (!form.categoryId) return "Category is required";
    if (form.basePrice === "" || isNaN(Number(form.basePrice))) return "Base price is required";
    if (form.baseStock === "" || isNaN(Number(form.baseStock))) return "Base stock is required";
    return "";
  };

  const parseImages = () => {
    const urls = form.imagesText
      .split(/[\n,]/g)
      .map((s) => s.trim())
      .filter(Boolean);
    return urls;
  };

  const save = async (e) => {
    e.preventDefault();
    setErr("");

    const msg = validate();
    if (msg) return setErr(msg);

    setSaving(true);
    try {
      const isEdit = !!form.id;

      const images = parseImages();
      const variants = (form.variants || [])
        .map((v) => ({
          name: (v.name || "").trim(),
          sku: (v.sku || "").trim() || null,
          price: Number(v.price),
          stock: Number(v.stock),
        }))
        .filter((v) => v.name && !Number.isNaN(v.price) && !Number.isNaN(v.stock));

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description?.trim() || null,
        brandId: form.brandId,
        categoryId: form.categoryId,
        basePrice: Number(form.basePrice),
        baseStock: Number(form.baseStock),
        status: form.status,
        featured: !!form.featured,
        prescriptionRequired: !!form.prescriptionRequired,

        discountType: form.discountType || null,
        discountValue: form.discountValue === "" ? null : Number(form.discountValue),
        discountStartAt: form.discountStartAt ? new Date(form.discountStartAt).toISOString() : null,
        discountEndAt: form.discountEndAt ? new Date(form.discountEndAt).toISOString() : null,

        images,
        variants,
      };

      const url = isEdit ? `${API_BASE}/products/${form.id}` : `${API_BASE}/products`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");

      setShowForm(false);
      await load(page);
    } catch (e) {
      setErr(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    const ok = window.confirm(`Delete product "${p.name}"?`);
    if (!ok) return;

    setErr("");
    try {
      const res = await fetch(`${API_BASE}/products/${p.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      await load(page);
    } catch (e) {
      setErr(e.message || "Delete failed");
    }
  };

  const addVariant = () =>
    setForm((s) => ({
      ...s,
      variants: [...(s.variants || []), { name: "", sku: "", price: "", stock: "" }],
    }));

  const updateVariant = (idx, key, value) =>
    setForm((s) => ({
      ...s,
      variants: s.variants.map((v, i) => (i === idx ? { ...v, [key]: value } : v)),
    }));

  const removeVariant = (idx) =>
    setForm((s) => ({
      ...s,
      variants: s.variants.filter((_, i) => i !== idx),
    }));

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-1">Products</h4>
          <div className="text-muted small">Manage products, pricing, stock, images, and variants.</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Product
        </button>
      </div>

      {err ? <div className="alert alert-danger">{err}</div> : null}

      {/* Filters */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <input
                className="form-control"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or slug…"
              />
            </div>

            <div className="col-12 col-md-3">
              <select className="form-select" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                <option value="">All brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-3">
              <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-2">
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All status</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>

            <div className="col-12 d-flex gap-2 mt-2">
              <button className="btn btn-outline-primary" onClick={applyFilters} disabled={loading}>
                Apply
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setQ("");
                  setBrandId("");
                  setCategoryId("");
                  setStatus("");
                  setTimeout(() => load(1), 0);
                }}
                disabled={loading}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

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
                    <th>Name</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Stock</th>
                    <th>Status</th>
                    <th className="text-end" style={{ width: 200 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-semibold">
                        {p.name}
                        <div className="text-muted small">{p.slug}</div>
                      </td>
                      <td>{p.brand?.name || "—"}</td>
                      <td>{p.category?.name || "—"}</td>
                      <td className="text-end">{p.basePrice}</td>
                      <td className="text-end">{p.baseStock}</td>
                      <td>
                        <span className={`badge ${p.status === "active" ? "text-bg-success" : "text-bg-secondary"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEdit(p)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove(p)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!items.length && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-5">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            Page {page} of {totalPages}
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" disabled={page <= 1 || loading} onClick={() => load(page - 1)}>
              Prev
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={page >= totalPages || loading}
              onClick={() => load(page + 1)}
            >
              Next
            </button>
          </div>
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
          <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div className="modal-content">
              <form onSubmit={save}>
                <div className="modal-header">
                  <h5 className="modal-title">{form.id ? "Edit Product" : "Add Product"}</h5>
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

                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={form.description}
                        onChange={(e) => setField("description", e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Brand *</label>
                      <select className="form-select" value={form.brandId} onChange={(e) => setField("brandId", e.target.value)}>
                        <option value="">Select brand</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        value={form.categoryId}
                        onChange={(e) => setField("categoryId", e.target.value)}
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label">Base Price *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.basePrice}
                        onChange={(e) => setField("basePrice", e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label">Base Stock *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.baseStock}
                        onChange={(e) => setField("baseStock", e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={form.status} onChange={(e) => setField("status", e.target.value)}>
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-3 d-flex align-items-end gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={form.featured}
                          onChange={(e) => setField("featured", e.target.checked)}
                          id="featured"
                        />
                        <label className="form-check-label" htmlFor="featured">
                          Featured
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={form.prescriptionRequired}
                          onChange={(e) => setField("prescriptionRequired", e.target.checked)}
                          id="rx"
                        />
                        <label className="form-check-label" htmlFor="rx">
                          Prescription
                        </label>
                      </div>
                    </div>

                    <div className="col-12">
                      <hr />
                      <div className="fw-semibold mb-2">Discount (optional)</div>
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label">Type</label>
                      <select
                        className="form-select"
                        value={form.discountType}
                        onChange={(e) => setField("discountType", e.target.value)}
                      >
                        <option value="">None</option>
                        <option value="percent">percent</option>
                        <option value="flat">flat</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label">Value</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.discountValue}
                        onChange={(e) => setField("discountValue", e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label">Start</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={form.discountStartAt}
                        onChange={(e) => setField("discountStartAt", e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label">End</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={form.discountEndAt}
                        onChange={(e) => setField("discountEndAt", e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <hr />
                      <div className="fw-semibold mb-2">Images (URLs)</div>
                      <div className="text-muted small mb-2">Paste image URLs separated by new lines or commas.</div>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={form.imagesText}
                        onChange={(e) => setField("imagesText", e.target.value)}
                        placeholder="https://... \nhttps://..."
                      />
                    </div>

                    <div className="col-12">
                      <hr />
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="fw-semibold">Variants (optional)</div>
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addVariant}>
                          + Add Variant
                        </button>
                      </div>

                      {form.variants.length ? (
                        <div className="table-responsive">
                          <table className="table table-sm align-middle">
                            <thead className="table-light">
                              <tr>
                                <th>Name</th>
                                <th>SKU</th>
                                <th className="text-end">Price</th>
                                <th className="text-end">Stock</th>
                                <th className="text-end" style={{ width: 90 }}>
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {form.variants.map((v, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <input
                                      className="form-control form-control-sm"
                                      value={v.name}
                                      onChange={(e) => updateVariant(idx, "name", e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      className="form-control form-control-sm"
                                      value={v.sku}
                                      onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm text-end"
                                      value={v.price}
                                      onChange={(e) => updateVariant(idx, "price", e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm text-end"
                                      value={v.stock}
                                      onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                                    />
                                  </td>
                                  <td className="text-end">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => removeVariant(idx)}
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-muted small">No variants added.</div>
                      )}
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