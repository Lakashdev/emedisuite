import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "/src/lib/api"; // ✅ uses /api base

function Badge({ children }) {
  return <span className="badge badge-soft rounded-pill px-3 py-2">{children}</span>;
}

function money(n) {
  const num = Number(n || 0);
  return `NPR ${num.toLocaleString("en-US")}`;
}

function safeJsonMessage(err) {
  // axios error -> readable message
  return (
    err?.response?.data?.message ||
    err?.message ||
    "Request failed"
  );
}

function ProductCard({ p }) {
  const img =
    p?.images?.[0]?.url ||
    p?.imageUrl ||
    null;

  const inStock = (Number(p?.baseStock || 0) > 0) || (p?.variants || []).some(v => Number(v.stock || 0) > 0);

  // If your backend returns computed discount fields, use them. Otherwise keep simple.
  const price = Number(p?.basePrice || 0);

  return (
    <div className="card card-soft h-100 overflow-hidden">
      <div className="position-relative" style={{ height: 160, background: "rgba(0,0,0,.03)" }}>
        {img ? (
          <img
            src={img}
            alt={p.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="h-100 d-flex align-items-center justify-content-center text-secondary small">
            No image
          </div>
        )}

        {!inStock ? (
          <span className="badge bg-dark position-absolute top-0 end-0 m-2 rounded-pill px-3 py-2">
            Out of stock
          </span>
        ) : null}
      </div>

      <div className="p-3">
        <div className="small text-secondary">
          {p.brand?.name || "—"} • {p.category?.name || "—"}
        </div>

        <div className="fw-semibold mt-1" style={{ minHeight: 42 }}>
          {p.name}
        </div>

        <div className="d-flex align-items-center gap-2 mt-1">
          <div className="fw-bold">{money(price)}</div>
        </div>

        <div className="d-grid mt-3">
          <button className="btn btn-brand btn-sm rounded-pill" disabled={!inStock}>
            Add to cart
          </button>
        </div>

        <div className="d-flex justify-content-between mt-2">
          <Link
            className="small text-decoration-none"
            style={{ color: "var(--brand)" }}
            to={`/products/${p.slug}`}
          >
            View
          </Link>
          <button className="btn btn-link btn-sm p-0 text-secondary" type="button" aria-label="wishlist">
            <i className="bi bi-heart" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductList() {
  const [searchParams] = useSearchParams();

  const initialQ = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || ""; // expects slug
  const initialBrand = searchParams.get("brand") || ""; // expects slug

  const [q, setQ] = useState(initialQ);
  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [brandSlug, setBrandSlug] = useState(initialBrand);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("newest");

  // server-side paging
  const [page, setPage] = useState(1);
  const limit = 12;

  // data
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // build slug -> id mapping (because your listProducts expects brandId/categoryId)
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

  // 1) Load brands + categories once
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
        // lookups failing shouldn't kill page, but show message
        if (!ignore) setErr(safeJsonMessage(e));
      }
    }

    loadLookups();
    return () => {
      ignore = true;
    };
  }, []);

  // 2) Load products whenever filters/page change
  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      setLoading(true);
      setErr("");

      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());

        // convert slug → id for your API
        const brandId = brandSlug ? brandSlugToId.get(brandSlug) : "";
        const categoryId = categorySlug ? categorySlugToId.get(categorySlug) : "";

        if (brandId) params.set("brandId", brandId);
        if (categoryId) params.set("categoryId", categoryId);

        params.set("page", String(page));
        params.set("limit", String(limit));

        // NOTE: your backend listProducts currently doesn't support sort/inStockOnly server-side.
        // We'll do those client-side after fetch.
        const res = await api.get(`/products?${params.toString()}`);

        if (ignore) return;

        const items = res.data?.items || [];
        setProducts(items);
        setTotalPages(res.data?.totalPages || 1);
      } catch (e) {
        if (!ignore) setErr(safeJsonMessage(e));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    // wait until lookups loaded if brand/category slug filters exist
    // (otherwise brandSlugToId/categorySlugToId maps are empty and won't filter)
    const needsLookups = (brandSlug && brands.length === 0) || (categorySlug && categories.length === 0);
    if (needsLookups) return;

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [q, brandSlug, categorySlug, page, limit, brandSlugToId, categorySlugToId, brands.length, categories.length]);

  // 3) Client-side filters not supported by your backend yet
  const filtered = useMemo(() => {
    let list = [...products];

    if (inStockOnly) {
      list = list.filter((p) => {
        const base = Number(p?.baseStock || 0) > 0;
        const anyVariant = (p?.variants || []).some(v => Number(v.stock || 0) > 0);
        return base || anyVariant;
      });
    }

    // sorting
    if (sort === "price_asc") list.sort((a, b) => Number(a.basePrice || 0) - Number(b.basePrice || 0));
    if (sort === "price_desc") list.sort((a, b) => Number(b.basePrice || 0) - Number(a.basePrice || 0));
    if (sort === "newest") list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return list;
  }, [products, inStockOnly, sort]);

  const clearFilters = () => {
    setQ("");
    setCategorySlug("");
    setBrandSlug("");
    setInStockOnly(false);
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="container py-4 py-md-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Products</h1>
          <div className="text-secondary">
            Browse pharmacy essentials. Use filters to find faster.
          </div>
        </div>

        {/* search */}
        <div className="card card-soft p-2" style={{ minWidth: 320 }}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-search text-secondary ms-2" />
            <input
              className="form-control border-0 shadow-none"
              placeholder="Search products..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
            {q ? (
              <button className="btn btn-light border rounded-pill px-3 me-2" type="button" onClick={() => { setQ(""); setPage(1); }}>
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {err ? <div className="alert alert-danger">{err}</div> : null}

      <div className="row g-3">
        {/* Filters */}
        <div className="col-12 col-lg-3">
          <div className="card card-soft p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="fw-bold">Filters</div>
              <button
                className="btn btn-link p-0 text-decoration-none"
                style={{ color: "var(--brand)" }}
                onClick={clearFilters}
                type="button"
              >
                Reset
              </button>
            </div>

            <div className="mb-3">
              <div className="small text-secondary mb-1">Category</div>
              <select
                className="form-select"
                value={categorySlug}
                onChange={(e) => {
                  setCategorySlug(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <div className="small text-secondary mb-1">Brand</div>
              <select
                className="form-select"
                value={brandSlug}
                onChange={(e) => {
                  setBrandSlug(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="inStockOnly"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setPage(1);
                }}
              />
              <label className="form-check-label" htmlFor="inStockOnly">
                In stock only
              </label>
            </div>

            <div className="mb-2">
              <div className="small text-secondary mb-1">Quick picks</div>
              <div className="d-flex flex-wrap gap-2">
                <Badge>Essentials</Badge>
                <Badge>Skincare</Badge>
                <Badge>Wellness</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div className="col-12 col-lg-9">
          <div className="card card-soft p-3 mb-3">
            <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center justify-content-between">
              <div className="text-secondary">
                {loading ? "Loading products..." : <>Showing <b>{filtered.length}</b> products.</>}
              </div>

              <div className="d-flex gap-2 align-items-center">
                <div className="small text-secondary">Sort</div>
                <select
                  className="form-select"
                  style={{ width: 220 }}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="card card-soft p-4">
              <div className="text-secondary">Loading…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card card-soft p-4">
              <div className="fw-semibold">No products found</div>
              <div className="text-secondary mt-1">Try removing some filters or changing the search.</div>
            </div>
          ) : (
            <div className="row g-3">
              {filtered.map((p) => (
                <div className="col-6 col-md-4 col-xl-3" key={p.id}>
                  <ProductCard p={p} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination (server-side) */}
          <div className="d-flex justify-content-center mt-4">
            <nav aria-label="Products pagination">
              <ul className="pagination">
                <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage((x) => Math.max(1, x - 1))} type="button">
                    Prev
                  </button>
                </li>

                <li className="page-item active">
                  <span className="page-link">{page}</span>
                </li>

                <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage((x) => Math.min(totalPages, x + 1))} type="button">
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <div className="small text-secondary text-center mt-2">
            Page {page} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
}