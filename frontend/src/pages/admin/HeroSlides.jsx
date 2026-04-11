// pages/admin/HeroSlides.jsx
// Route: /admin/hero-slides
// Add to AppRoutes.jsx:  <Route path="/admin/hero-slides" element={<HeroSlides />} />

import { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const ICONS = [
  "bi-sun", "bi-stars", "bi-emoji-smile", "bi-heart", "bi-capsule",
  "bi-droplet", "bi-brightness-high", "bi-moon-stars", "bi-bag-heart",
  "bi-activity", "bi-shield-check", "bi-flower1",
];

const EMPTY_FORM = {
  tag: "",
  headline: "",
  sub: "",
  pill: "",
  ctaLabel: "",
  ctaHref: "/products",
  ctaAltLabel: "Explore all",
  ctaAltHref: "/products",
  featName: "",
  featPrice: "",
  featOld: "",
  icon: "bi-stars",
  stat1Val: "100%",
  stat1Label: "Genuine",
  stat2Val: "Same Day",
  stat2Label: "Delivery",
  micro1: "Verified brands",
  micro2: "Delivers in Kathmandu",
  micro3: "Licensed pharmacy",
  accent: "#6BBF4E",
  bg: "linear-gradient(135deg, #E8F5E2 0%, #F4F8F0 55%, #EEF2F8 100%)",
  productId: "",
  status: "active",
  position: 0,
};

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function ProductPicker({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);
 
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
 
  // Close dropdown on outside click
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);
 
  // Search products
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/products?search=${encodeURIComponent(query)}&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d?.items) ? d.items : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query, open]);
 
  // If editing an existing slide, load the selected product name
  useEffect(() => {
    if (!value) { setSelected(null); return; }
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/products/${value}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setSelected(d))
      .catch(() => setSelected(null));
  }, [value]);
 
  function pick(product) {
    setSelected(product);
    onChange(product.id);
    setOpen(false);
    setQuery("");
  }
 
  function clear() {
    setSelected(null);
    onChange("");
  }
 
  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1.5px solid #e2e8f0", fontSize: 13.5,
    boxSizing: "border-box", fontFamily: "inherit", outline: "none",
  };
 
  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Selected state */}
      {selected ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 12px", borderRadius: 8,
          border: "1.5px solid #6BBF4E", background: "#F0FDF4",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#1B3D6E" }}>{selected.name}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>NPR {selected.basePrice?.toLocaleString()}</div>
          </div>
          <button
            type="button"
            onClick={clear}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16, padding: 0 }}
          >
            ×
          </button>
        </div>
      ) : (
        <input
          style={{ ...inputStyle, cursor: "pointer" }}
          placeholder="🔍 Search products to link..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
      )}
 
      {/* Dropdown */}
      {open && !selected && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,.10)", zIndex: 100,
          maxHeight: 240, overflowY: "auto",
        }}>
          {loading ? (
            <div style={{ padding: "14px 16px", color: "#94a3b8", fontSize: 13 }}>Searching…</div>
          ) : products.length === 0 ? (
            <div style={{ padding: "14px 16px", color: "#94a3b8", fontSize: 13 }}>No products found</div>
          ) : (
            products.map((p) => (
              <div
                key={p.id}
                onClick={() => pick(p)}
                style={{
                  padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f1f5f9",
                  display: "flex", alignItems: "center", gap: 10,
                  transition: "background .12s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {/* Product thumbnail */}
                {p.images?.[0]?.url ? (
                  <img src={p.images[0].url} alt={p.name}
                    style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: "#EEF2F8", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="bi bi-box-seam" style={{ color: "#94a3b8", fontSize: 14 }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: "#1B3D6E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>NPR {p.basePrice?.toLocaleString()} · {p.brand?.name}</div>
                </div>
                <i className="bi bi-plus-circle" style={{ color: "#6BBF4E", fontSize: 16, flexShrink: 0 }} />
              </div>
            ))
          )}
          {/* Clear / no link option */}
          <div
            onClick={() => { onChange(""); setOpen(false); setQuery(""); }}
            style={{ padding: "10px 14px", cursor: "pointer", color: "#94a3b8", fontSize: 13, borderTop: "1px solid #f1f5f9" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <i className="bi bi-x-circle me-2" />
            No product link (display only)
          </div>
        </div>
      )}
    </div>
  );
}

export default function HeroSlides() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null); // null = create
  const [form, setForm] = useState(EMPTY_FORM);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  async function loadSlides() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/hero-slides/admin`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setSlides(data.items || []);
    } catch {
      setError("Could not load hero slides.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSlides(); }, []);

  // ── Flash message ──────────────────────────────────────────────────────────
  function flash(msg, isErr = false) {
    if (isErr) setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 3500);
  }

  // ── Open modal ─────────────────────────────────────────────────────────────
  function openCreate() {
    setEditId(null);
    setForm({ ...EMPTY_FORM, position: slides.length });
    setShowModal(true);
  }

  function openEdit(slide) {
    setEditId(slide.id);
    setForm({
      tag: slide.tag,
      headline: slide.headline,
      sub: slide.sub,
      pill: slide.pill || "",
      ctaLabel: slide.ctaLabel,
      ctaHref: slide.ctaHref,
      ctaAltLabel: slide.ctaAltLabel,
      ctaAltHref: slide.ctaAltHref,
      featName: slide.featName,
      featPrice: String(slide.featPrice),
      featOld: String(slide.featOld),
      icon: slide.icon,
      stat1Val: slide.stat1Val,
      stat1Label: slide.stat1Label,
      stat2Val: slide.stat2Val,
      stat2Label: slide.stat2Label,
      micro1: slide.micro1,
      micro2: slide.micro2,
      micro3: slide.micro3,
      accent: slide.accent,
      bg: slide.bg,
      productId: slide.productId || "",
      status: slide.status,
      position: slide.position,
    });
    setShowModal(true);
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    const url = editId
      ? `${API_BASE}/hero-slides/admin/${editId}`
      : `${API_BASE}/hero-slides/admin`;
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...form,
          featPrice: parseInt(form.featPrice),
          featOld: parseInt(form.featOld),
          position: parseInt(form.position),
          productId: form.productId || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Save failed");
      }
      flash(editId ? "Slide updated!" : "Slide created!");
      setShowModal(false);
      loadSlides();
    } catch (err) {
      flash(err.message, true);
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(id) {
    if (!window.confirm("Delete this slide?")) return;
    try {
      const res = await fetch(`${API_BASE}/hero-slides/admin/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      flash("Slide deleted.");
      loadSlides();
    } catch (err) {
      flash(err.message, true);
    }
  }

  // ── Toggle status ──────────────────────────────────────────────────────────
  async function toggleStatus(slide) {
    const next = slide.status === "active" ? "draft" : "active";
    try {
      const res = await fetch(`${API_BASE}/hero-slides/admin/${slide.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      setSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, status: next } : s))
      );
    } catch {
      flash("Failed to update status", true);
    }
  }

  // ── Move up/down (reorder) ─────────────────────────────────────────────────
  async function move(index, dir) {
    const next = [...slides];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setSlides(next);

    await fetch(`${API_BASE}/hero-slides/admin/reorder`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ order: next.map((s) => s.id) }),
    });
  }

  // ── Field helper ───────────────────────────────────────────────────────────
  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  // ── Styles ─────────────────────────────────────────────────────────────────
  const s = {
    page: { padding: "32px 24px", maxWidth: 960, margin: "0 auto", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
    title: { fontSize: 22, fontWeight: 800, color: "#1B3D6E", margin: 0 },
    btn: (color = "#1B3D6E") => ({
      background: color, color: "#fff", border: "none", borderRadius: 8,
      padding: "9px 18px", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 6,
    }),
    btnOutline: {
      background: "transparent", border: "1.5px solid #e2e8f0", borderRadius: 8,
      padding: "7px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer",
      color: "#475569",
    },
    alert: (ok) => ({
      padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13.5,
      background: ok ? "#F0FDF4" : "#FEF2F2",
      color: ok ? "#15803d" : "#b91c1c",
      border: `1px solid ${ok ? "#bbf7d0" : "#fecaca"}`,
    }),
    card: {
      background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14,
      marginBottom: 14, padding: "18px 20px",
      display: "flex", alignItems: "center", gap: 16,
    },
    pill: (active) => ({
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
      background: active ? "#F0FDF4" : "#F8FAFC",
      color: active ? "#15803d" : "#94a3b8",
      border: `1px solid ${active ? "#bbf7d0" : "#e2e8f0"}`,
    }),
    overlay: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center",
      overflowY: "auto", padding: "40px 16px",
    },
    modal: {
      background: "#fff", borderRadius: 16, width: "100%", maxWidth: 660,
      padding: 32, position: "relative",
    },
    label: { display: "block", fontSize: 12.5, fontWeight: 700, color: "#475569", marginBottom: 5 },
    input: {
      width: "100%", padding: "9px 12px", borderRadius: 8,
      border: "1.5px solid #e2e8f0", fontSize: 13.5, boxSizing: "border-box",
      fontFamily: "inherit", outline: "none",
    },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
    section: { marginBottom: 22 },
    sectionTitle: { fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 12 },
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Hero Slides</h1>
          <p style={{ color: "#64748b", fontSize: 13.5, marginTop: 4 }}>
            Manage the homepage hero carousel — drag to reorder, toggle draft/active.
          </p>
        </div>
        <button style={s.btn()} onClick={openCreate}>
          <i className="bi bi-plus-lg" /> Add Slide
        </button>
      </div>

      {/* Flash messages */}
      {error && <div style={s.alert(false)}>{error}</div>}
      {success && <div style={s.alert(true)}>{success}</div>}

      {/* Slide list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>Loading slides…</div>
      ) : slides.length === 0 ? (
        <div style={{ textAlign: "center", padding: 64, color: "#94a3b8" }}>
          <i className="bi bi-images" style={{ fontSize: 40, display: "block", marginBottom: 12 }} />
          No slides yet. Click "Add Slide" to create your first.
        </div>
      ) : (
        slides.map((slide, i) => (
          <div key={slide.id} style={s.card}>
            {/* Color swatch */}
            <div style={{ width: 44, height: 44, borderRadius: 10, background: slide.bg, flexShrink: 0, border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className={`bi ${slide.icon}`} style={{ color: slide.accent, fontSize: 18 }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: "#1B3D6E", fontSize: 14.5 }}>{slide.featName}</div>
              <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
                <span style={{ fontWeight: 600 }}>{slide.tag}</span> · "{slide.headline.replace("\\n", " ")}"
              </div>
              <div style={{ marginTop: 6 }}>
                <span style={s.pill(slide.status === "active")}>
                  {slide.status === "active" ? "Active" : "Draft"}
                </span>
                <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>
                  Position {slide.position + 1}
                </span>
              </div>
            </div>

            {/* NPR */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontWeight: 800, color: "#1B3D6E", fontSize: 15 }}>NPR {slide.featPrice.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", textDecoration: "line-through" }}>NPR {slide.featOld.toLocaleString()}</div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button style={s.btnOutline} onClick={() => move(i, -1)} disabled={i === 0} title="Move up">↑</button>
              <button style={s.btnOutline} onClick={() => move(i, 1)} disabled={i === slides.length - 1} title="Move down">↓</button>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={s.btnOutline} onClick={() => toggleStatus(slide)} title="Toggle active/draft">
                {slide.status === "active" ? <i className="bi bi-eye-slash" /> : <i className="bi bi-eye" />}
              </button>
              <button style={s.btnOutline} onClick={() => openEdit(slide)}>
                <i className="bi bi-pencil" />
              </button>
              <button style={{ ...s.btnOutline, color: "#ef4444" }} onClick={() => handleDelete(slide.id)}>
                <i className="bi bi-trash" />
              </button>
            </div>
          </div>
        ))
      )}

      {/* ── MODAL ── */}
      {showModal && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1B3D6E" }}>
                {editId ? "Edit Slide" : "New Slide"}
              </h2>
              <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }} onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSave}>

              {/* ── Hero content ── */}
              <div style={s.section}>
                <div style={s.sectionTitle}>Hero Text</div>
                <div style={{ marginBottom: 12 }}>
                  <label style={s.label}>Tag (pill top-left) *</label>
                  <input style={s.input} placeholder="Baby & Family" required {...field("tag")} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={s.label}>Headline * (use \n for line break)</label>
                  <input style={s.input} placeholder="Gentle Care\nfor Every One." required {...field("headline")} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={s.label}>Subtitle *</label>
                  <input style={s.input} placeholder="Safe, tested, and trusted for the whole family." required {...field("sub")} />
                </div>
                <div>
                  <label style={s.label}>Offer pill text</label>
                  <input style={s.input} placeholder="Dermatologist tested" {...field("pill")} />
                </div>
              </div>

              {/* ── Buttons ── */}
              <div style={s.section}>
                <div style={s.sectionTitle}>Buttons</div>
                <div style={s.grid2}>
                  <div>
                    <label style={s.label}>Primary button label *</label>
                    <input style={s.input} placeholder="Shop Baby Care" required {...field("ctaLabel")} />
                  </div>
                  <div>
                    <label style={s.label}>Primary button link *</label>
                    <input style={s.input} placeholder="/products?category=baby-care" required {...field("ctaHref")} />
                  </div>
                  <div>
                    <label style={s.label}>Secondary button label</label>
                    <input style={s.input} placeholder="Family wellness" {...field("ctaAltLabel")} />
                  </div>
                  <div>
                    <label style={s.label}>Secondary button link</label>
                    <input style={s.input} placeholder="/products" {...field("ctaAltHref")} />
                  </div>
                </div>
              </div>

              {/* ── Featured product card ── */}
              <div style={s.section}>
                <div style={s.sectionTitle}>Featured Product Card (right side)</div>
                <div style={{ marginBottom: 12 }}>
                  <label style={s.label}>Display name * <span style={{ fontWeight: 400, color: "#94a3b8" }}>(shown on card)</span></label>
                  <input style={s.input} placeholder="Baby Wash Gentle" required {...field("featName")} />
                </div>
                <div style={s.grid2}>
                  <div>
                    <label style={s.label}>Sale price (NPR) *</label>
                    <input style={s.input} type="number" placeholder="599" required {...field("featPrice")} />
                  </div>
                  <div>
                    <label style={s.label}>Original price (NPR) *</label>
                    <input style={s.input} type="number" placeholder="749" required {...field("featOld")} />
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <label style={s.label}>
                    Link to product <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional — enables image + product page link)</span>
                  </label>
                  <ProductPicker
                    value={form.productId}
                    onChange={(id) => setForm((f) => ({ ...f, productId: id }))}
                  />
                </div>
              </div>
              {/* ── Stat cards ── */}
              <div style={s.section}>
                <div style={s.sectionTitle}>Stat Cards (bottom right)</div>
                <div style={s.grid2}>
                  <div>
                    <label style={s.label}>Stat 1 value</label>
                    <input style={s.input} placeholder="100%" {...field("stat1Val")} />
                  </div>
                  <div>
                    <label style={s.label}>Stat 1 label</label>
                    <input style={s.input} placeholder="Genuine" {...field("stat1Label")} />
                  </div>
                  <div>
                    <label style={s.label}>Stat 2 value</label>
                    <input style={s.input} placeholder="Same Day" {...field("stat2Val")} />
                  </div>
                  <div>
                    <label style={s.label}>Stat 2 label</label>
                    <input style={s.input} placeholder="Delivery" {...field("stat2Label")} />
                  </div>
                </div>
              </div>

              {/* ── Micro trust ── */}
              <div style={s.section}>
                <div style={s.sectionTitle}>Micro Trust Badges (bottom left)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={s.label}>Badge 1</label>
                    <input style={s.input} placeholder="Verified brands" {...field("micro1")} />
                  </div>
                  <div>
                    <label style={s.label}>Badge 2</label>
                    <input style={s.input} placeholder="Delivers in Kathmandu" {...field("micro2")} />
                  </div>
                  <div>
                    <label style={s.label}>Badge 3</label>
                    <input style={s.input} placeholder="Licensed pharmacy" {...field("micro3")} />
                  </div>
                </div>
              </div>

              {/* ── Appearance ── */}
              <div style={s.section}>
                <div style={s.sectionTitle}>Appearance</div>
                <div style={s.grid2}>
                  <div>
                    <label style={s.label}>Accent colour</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="color" value={form.accent} onChange={(e) => setForm((f) => ({ ...f, accent: e.target.value }))}
                        style={{ width: 44, height: 36, borderRadius: 8, border: "1.5px solid #e2e8f0", padding: 2, cursor: "pointer" }} />
                      <input style={{ ...s.input, flex: 1 }} {...field("accent")} placeholder="#6BBF4E" />
                    </div>
                  </div>
                  <div>
                    <label style={s.label}>Icon (Bootstrap Icons class)</label>
                    <select style={s.input} value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}>
                      {ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <label style={s.label}>Background gradient CSS</label>
                  <input style={s.input} {...field("bg")} placeholder="linear-gradient(135deg, #E8F5E2 0%, …)" />
                  <div style={{ marginTop: 6, height: 20, borderRadius: 6, background: form.bg, border: "1px solid #e2e8f0" }} />
                </div>
              </div>

              {/* ── Settings ── */}
              <div style={s.section}>
                <div style={s.sectionTitle}>Settings</div>
                <div style={s.grid2}>
                  <div>
                    <label style={s.label}>Status</label>
                    <select style={s.input} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div>
                    <label style={s.label}>Position (0 = first)</label>
                    <input style={s.input} type="number" min={0} {...field("position")} />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" style={s.btnOutline} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={s.btn()} disabled={saving}>
                  {saving ? "Saving…" : editId ? "Save Changes" : "Create Slide"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}