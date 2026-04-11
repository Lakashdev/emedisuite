import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { api } from "/src/lib/api";

/* ─── BRAND TOKENS (injected via <style> below) ─── */
const BRAND_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Lora:wght@400;600;700&display=swap');

.ms-root {
  font-family: 'Plus Jakarta Sans', sans-serif;
  --navy: #1B3D6E;
  --navy-dark: #142E55;
  --navy-mid: #2A5298;
  --green: #6BBF4E;
  --green-dark: #52A036;
  --green-light: #E8F5E2;
  --navy-light: #EEF2F8;
  --navy-xlight: #F5F8FF;
  --text-main: #0D1B2E;
  --text-mid: #3D5470;
  --text-muted: #7A92AE;
  --border: #DCE8F0;
  --white: #ffffff;
  --off-white: #F7FAFD;
  color: var(--text-main);
  background: var(--off-white);
}

/* Page header */
.ms-page-header {
  background: linear-gradient(135deg, var(--navy-light) 0%, var(--green-light) 100%);
  border-bottom: 2px solid var(--border);
  padding: 36px 0 28px;
  margin-bottom: 32px;
}
.ms-page-eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--green-dark);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.ms-page-eyebrow::before {
  content: '';
  display: block;
  width: 22px;
  height: 2px;
  background: var(--green-dark);
  flex-shrink: 0;
}
.ms-page-title {
  font-family: 'Lora', serif;
  font-size: clamp(26px, 3.5vw, 36px);
  font-weight: 700;
  color: var(--navy);
  margin: 0 0 6px;
  letter-spacing: -0.025em;
}
.ms-page-sub {
  font-size: 14.5px;
  color: var(--text-mid);
  margin: 0;
  font-weight: 400;
}

/* Search bar */
.ms-search-wrap {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 300px;
  max-width: 420px;
  box-shadow: 0 2px 8px rgba(27,61,110,.06);
  transition: border-color .2s, box-shadow .2s;
}
.ms-search-wrap:focus-within {
  border-color: var(--navy);
  box-shadow: 0 0 0 3px rgba(27,61,110,.08);
}
.ms-search-icon { color: var(--text-muted); font-size: 14px; flex-shrink: 0; }
.ms-search-input {
  border: none;
  outline: none;
  background: transparent;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  color: var(--text-main);
  flex: 1;
  min-width: 0;
}
.ms-search-input::placeholder { color: var(--text-muted); }
.ms-search-clear {
  background: var(--navy-light);
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--navy);
  cursor: pointer;
  white-space: nowrap;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background .2s;
}
.ms-search-clear:hover { background: var(--border); }

/* Sidebar */
.ms-sidebar {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  position: sticky;
  top: 80px;
}
.ms-sidebar-title {
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--navy);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ms-sidebar-title i { color: var(--green-dark); font-size: 14px; }
.ms-filter-label {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--text-muted);
  margin-bottom: 6px;
  display: block;
}
.ms-select {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  background: var(--off-white);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px;
  color: var(--text-main);
  outline: none;
  cursor: pointer;
  transition: border-color .2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3E%3Cpath fill='%237A92AE' d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}
.ms-select:focus { border-color: var(--navy); box-shadow: 0 0 0 3px rgba(27,61,110,.07); }

.ms-checkbox-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 9px;
  border: 1.5px solid var(--border);
  background: var(--off-white);
  cursor: pointer;
  transition: border-color .2s, background .2s;
}
.ms-checkbox-wrap:has(input:checked) {
  border-color: var(--green);
  background: var(--green-light);
}
.ms-checkbox {
  width: 16px; height: 16px;
  accent-color: var(--green-dark);
  cursor: pointer;
}
.ms-checkbox-label {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
}
.ms-reset-btn {
  background: none;
  border: none;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--navy);
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.ms-reset-btn:hover { color: var(--green-dark); }

/* Quick pick tags */
.ms-tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: var(--navy);
  background: var(--navy-light);
  border: 1.5px solid var(--border);
  cursor: pointer;
  transition: background .2s, border-color .2s, color .2s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.ms-tag:hover { background: var(--navy); color: var(--white); border-color: var(--navy); }

/* Toolbar */
.ms-toolbar {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.ms-count {
  font-size: 13.5px;
  color: var(--text-mid);
}
.ms-count b { color: var(--navy); font-weight: 800; }
.ms-sort-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .05em;
}

/* Product card */
.ms-product-card {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}
.ms-product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 40px rgba(27,61,110,.12);
  border-color: #BDD4EA;
}
.ms-product-img-wrap {
  position: relative;
  height: 168px;
  background: linear-gradient(135deg, var(--navy-light), var(--green-light));
  overflow: hidden;
  flex-shrink: 0;
}
.ms-product-img-wrap img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform .35s ease;
}
.ms-product-card:hover .ms-product-img-wrap img { transform: scale(1.04); }
.ms-out-badge {
  position: absolute;
  top: 10px; right: 10px;
  background: rgba(13,27,46,.72);
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  backdrop-filter: blur(4px);
}
.ms-wish-btn {
  position: absolute;
  top: 10px; left: 10px;
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--white);
  color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: color .2s, border-color .2s, background .2s;
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
}
.ms-wish-btn:hover { color: #E63946; border-color: #E63946; background: #FFF0F1; }
.ms-product-body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.ms-product-meta {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--text-muted);
  margin-bottom: 4px;
}
.ms-product-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.4;
  min-height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
}
.ms-product-price {
  font-family: 'Lora', serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 12px;
}
.ms-add-btn {
  width: 100%;
  padding: 9px 12px;
  border-radius: 9px;
  background: var(--navy);
  color: var(--white);
  font-size: 13px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background .2s, transform .1s;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  margin-top: auto;
}
.ms-add-btn:hover:not(:disabled) { background: var(--navy-dark); }
.ms-add-btn:active:not(:disabled) { transform: scale(.97); }
.ms-add-btn:disabled {
  background: var(--border);
  color: var(--text-muted);
  cursor: not-allowed;
}
.ms-add-btn.added {
  background: var(--green-dark);
}
.ms-view-hint {
  text-align: center;
  font-size: 10.5px;
  color: var(--text-muted);
  margin-top: 8px;
  font-weight: 500;
}

/* Empty / loading */
.ms-empty {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 56px 32px;
  text-align: center;
}
.ms-empty-icon {
  font-size: 40px;
  color: var(--border);
  display: block;
  margin-bottom: 12px;
}
.ms-empty-title { font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 6px; }
.ms-empty-sub { font-size: 13.5px; color: var(--text-muted); margin-bottom: 20px; }
.ms-clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  border-radius: 9px;
  background: var(--navy);
  color: var(--white);
  font-size: 13.5px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background .2s;
}
.ms-clear-btn:hover { background: var(--navy-dark); }

/* Pagination */
.ms-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  margin-top: 36px;
}
.ms-page-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 20px;
  border-radius: 9px;
  border: 1.5px solid var(--border);
  background: var(--white);
  font-size: 13.5px;
  font-weight: 700;
  color: var(--navy);
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background .2s, border-color .2s;
}
.ms-page-btn:hover:not(:disabled) { background: var(--navy); color: var(--white); border-color: var(--navy); }
.ms-page-btn:disabled { opacity: .4; cursor: not-allowed; }
.ms-page-info { font-size: 13.5px; color: var(--text-mid); font-weight: 600; }
.ms-page-info b { color: var(--navy); }

/* Error */
.ms-alert {
  background: #FEF2F2;
  border: 1.5px solid #FCA5A5;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13.5px;
  color: #991B1B;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Divider */
.ms-sidebar-divider {
  border: none;
  border-top: 1.5px solid var(--border);
  margin: 18px 0;
}

/* Cart toast */
.ms-cart-toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  background: var(--navy);
  color: #fff;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 24px rgba(27,61,110,.25);
  z-index: 9999;
  animation: slideUp .25s ease;
}
.ms-cart-toast a {
  color: var(--green);
  text-decoration: none;
  font-weight: 800;
}
.ms-cart-toast a:hover { text-decoration: underline; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

function stopProp(e) { e.stopPropagation(); }

function money(n) {
  const num = Number(n || 0);
  return `NPR ${num.toLocaleString("en-US")}`;
}

function safeJsonMessage(err) {
  return err?.response?.data?.message || err?.message || "Request failed";
}

/* ─── Cart Toast ─── */
function CartToast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="ms-cart-toast">
      <i className="bi bi-check-circle-fill" style={{ color: "#6BBF4E" }} />
      <span>{message}</span>
      <a href="/cart">View cart →</a>
    </div>
  );
}

/* ─── Product Card ─── */
function ProductCard({ p }) {
  const navigate = useNavigate();
  const img = p?.images?.[0]?.url || p?.imageUrl || null;
  const inStock =
    Number(p?.baseStock || 0) > 0 ||
    (p?.variants || []).some((v) => Number(v.stock || 0) > 0);
  const price = Number(p?.basePrice || 0);

  function handleCardClick() { navigate(`/products/${p.slug}`); }
  function handleWishlist(e) { stopProp(e); }

  function handleViewDetails(e) {
    stopProp(e);
    navigate(`/products/${p.slug}`);
  }

  return (
    <div
      className="ms-product-card"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleCardClick(); }}
    >
      <div className="ms-product-img-wrap">
        {img ? (
          <img src={img} alt={p.name} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="bi bi-capsule" style={{ fontSize: 36, color: "var(--navy)", opacity: .3 }} />
          </div>
        )}
        {!inStock && <span className="ms-out-badge">Out of stock</span>}
        <button className="ms-wish-btn" type="button" aria-label="Add to wishlist" onClick={handleWishlist}>
          <i className="bi bi-heart" />
        </button>
      </div>

      <div className="ms-product-body">
        <div className="ms-product-meta">
          {p.brand?.name || "—"} &bull; {p.category?.name || "—"}
        </div>
        <div className="ms-product-name">{p.name}</div>
        <div className="ms-product-price">{money(price)}</div>
        <button
          className="ms-add-btn"
          type="button"
          onClick={handleViewDetails}
        >
          <i className="bi bi-eye" /> View details
        </button>
        {!inStock && (
          <div className="ms-view-hint" style={{ color: "var(--text-muted)" }}>Currently out of stock</div>
        )}
      </div>
    </div>
  );
}

ProductCard.propTypes = {
  p: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    name: PropTypes.string,
    imageUrl: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.shape({ url: PropTypes.string })),
    baseStock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    basePrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    variants: PropTypes.arrayOf(
      PropTypes.shape({ stock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) })
    ),
    brand: PropTypes.shape({ name: PropTypes.string }),
    category: PropTypes.shape({ name: PropTypes.string }),
  }).isRequired,
};

/* ─── MAIN PAGE ─── */
export default function ProductList() {
  const [searchParams] = useSearchParams();

  const initialQ = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialBrand = searchParams.get("brand") || "";

  const [q, setQ] = useState(initialQ);
  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [brandSlug, setBrandSlug] = useState(initialBrand);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const limit = 12;

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const brandSlugToId = useMemo(() => {
    const m = new Map();
    for (const b of brands) m.set(b.slug, b.id);
    return m;
  }, [brands]);

  const categorySlugToId = useMemo(() => {
    const m = new Map();
    for (const c of categories) m.set(c.slug, c.id);
    return m;
  }, [categories]);

  useEffect(() => {
    let ignore = false;
    async function loadLookups() {
      try {
        const [bRes, cRes] = await Promise.all([
          api.get("/brands"),
          api.get("/categories"),
        ]);
        if (ignore) return;
        setBrands(bRes.data?.items || []);
        setCategories(cRes.data?.items || []);
      } catch (e) {
        if (!ignore) setErr(safeJsonMessage(e));
      }
    }
    loadLookups();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadProducts() {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        const brandId = brandSlug ? brandSlugToId.get(brandSlug) : "";
        const categoryId = categorySlug ? categorySlugToId.get(categorySlug) : "";
        if (brandId) params.set("brandId", brandId);
        if (categoryId) params.set("categoryId", categoryId);
        params.set("page", String(page));
        params.set("limit", String(limit));
        const res = await api.get(`/products?${params.toString()}`);
        if (ignore) return;
        setProducts(res.data?.items || []);
        setTotalPages(res.data?.totalPages || 1);
      } catch (e) {
        if (!ignore) setErr(safeJsonMessage(e));
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    const needsLookups =
      (brandSlug && brands.length === 0) ||
      (categorySlug && categories.length === 0);
    if (needsLookups) return;
    loadProducts();
    return () => { ignore = true; };
  }, [q, brandSlug, categorySlug, page, limit, brandSlugToId, categorySlugToId, brands.length, categories.length]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (inStockOnly) {
      list = list.filter((p) => {
        const base = Number(p?.baseStock || 0) > 0;
        const anyVariant = (p?.variants || []).some((v) => Number(v.stock || 0) > 0);
        return base || anyVariant;
      });
    }
    if (sort === "price_asc") list.sort((a, b) => Number(a.basePrice || 0) - Number(b.basePrice || 0));
    if (sort === "price_desc") list.sort((a, b) => Number(b.basePrice || 0) - Number(a.basePrice || 0));
    if (sort === "newest") list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }, [products, inStockOnly, sort]);

  const clearFilters = () => {
    setQ(""); setCategorySlug(""); setBrandSlug("");
    setInStockOnly(false); setSort("newest"); setPage(1);
  };

  const hasActiveFilters = q || categorySlug || brandSlug || inStockOnly;

  /* ── Render product grid ── */
  function renderProductGrid() {
    if (loading) {
      return (
        <div className="ms-empty">
          <div className="spinner-border spinner-border-sm mx-auto d-block mb-3" style={{ color: "var(--navy)", width: 28, height: 28 }} role="status" />
          <div className="ms-empty-title">Loading products…</div>
          <div className="ms-empty-sub">Fetching the latest from our pharmacy.</div>
        </div>
      );
    }
    if (filtered.length === 0) {
      return (
        <div className="ms-empty">
          <i className="bi bi-box-seam ms-empty-icon" />
          <div className="ms-empty-title">No products found</div>
          <div className="ms-empty-sub">Try removing some filters or changing your search term.</div>
          <button className="ms-clear-btn" type="button" onClick={clearFilters}>
            <i className="bi bi-x-circle" />Clear all filters
          </button>
        </div>
      );
    }
    return (
      <div className="row g-3">
        {filtered.map((p) => (
          <div className="col-6 col-md-4 col-xl-3" key={p.id}>
            <ProductCard p={p} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="ms-root">
      <style>{BRAND_CSS}</style>

      {/* Page Header */}
      <div className="ms-page-header">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3">
            <div>
              <div className="ms-page-eyebrow">Medisuite Pharmacy</div>
              <h1 className="ms-page-title">All Products</h1>
              <p className="ms-page-sub">Browse pharmacy essentials — click any product to view details.</p>
            </div>
            {/* Search */}
            <div className="ms-search-wrap">
              <i className="bi bi-search ms-search-icon" />
              <input
                className="ms-search-input"
                placeholder="Search products…"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
              />
              {q && (
                <button className="ms-search-clear" type="button" onClick={() => { setQ(""); setPage(1); }}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container pb-5">
        {err && (
          <div className="ms-alert">
            <i className="bi bi-exclamation-triangle-fill" />{err}
          </div>
        )}

        <div className="row g-4">
          {/* ── SIDEBAR ── */}
          <div className="col-12 col-lg-3">
            <div className="ms-sidebar">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="ms-sidebar-title">
                  <i className="bi bi-sliders" />Filters
                </div>
                {hasActiveFilters && (
                  <button className="ms-reset-btn" type="button" onClick={clearFilters}>
                    Reset all
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="ms-filter-label">Category</label>
                <select
                  className="ms-select"
                  value={categorySlug}
                  onChange={(e) => { setCategorySlug(e.target.value); setPage(1); }}
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="mb-3">
                <label className="ms-filter-label">Brand</label>
                <select
                  className="ms-select"
                  value={brandSlug}
                  onChange={(e) => { setBrandSlug(e.target.value); setPage(1); }}
                >
                  <option value="">All brands</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.slug}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* In stock */}
              <div className="mb-3">
                <label className="ms-filter-label">Availability</label>
                <label className="ms-checkbox-wrap">
                  <input
                    className="ms-checkbox"
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                  />
                  <span className="ms-checkbox-label">In stock only</span>
                </label>
              </div>

              <hr className="ms-sidebar-divider" />

              {/* Quick picks */}
              <div>
                <label className="ms-filter-label">Quick picks</label>
                <div className="d-flex flex-wrap gap-2">
                  {["Essentials", "Skincare", "Wellness", "Baby Care", "Vitamins"].map((tag) => (
                    <button key={tag} className="ms-tag" type="button">{tag}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── PRODUCT GRID ── */}
          <div className="col-12 col-lg-9">
            {/* Toolbar */}
            <div className="ms-toolbar">
              <div className="ms-count">
                {loading
                  ? "Loading…"
                  : <><b>{filtered.length}</b> of <b>{products.length}</b> products</>}
              </div>
              <div className="d-flex gap-2 align-items-center">
                <span className="ms-sort-label">Sort</span>
                <select
                  className="ms-select"
                  style={{ width: 200 }}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {renderProductGrid()}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="ms-pagination">
                <button
                  className="ms-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((x) => Math.max(1, x - 1))}
                  type="button"
                >
                  <i className="bi bi-chevron-left" style={{ fontSize: 12 }} />Prev
                </button>
                <span className="ms-page-info">Page <b>{page}</b> of <b>{totalPages}</b></span>
                <button
                  className="ms-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((x) => Math.min(totalPages, x + 1))}
                  type="button"
                >
                  Next<i className="bi bi-chevron-right" style={{ fontSize: 12 }} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}