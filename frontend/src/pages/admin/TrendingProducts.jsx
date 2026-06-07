import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  adminGetTrendingProducts,
  adminSaveTrendingProducts,
  adminSearchProducts,
} from "../../api/trendingProducts";

const MAX = 6;

export default function TrendingProducts() {
  const { token } = useAuth();

  const [trending, setTrending] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState(null);

  /* ── load current trending list on mount ── */
  useEffect(() => {
    adminGetTrendingProducts(token)
      .then((data) => setTrending(data.items || []))
      .catch((e) => setErr(e.message || "Failed to load trending products"))
      .finally(() => setLoading(false));
  }, [token]);

  /* ── search catalog with 300ms debounce ── */
  useEffect(() => {
    const t = setTimeout(() => {
      if (!query.trim()) {
        setCatalog([]);
        return;
      }
      adminSearchProducts(token, query)
        .then((data) => setCatalog(data.items || []))
        .catch(() => setCatalog([]));
    }, 300);
    return () => clearTimeout(t);
  }, [query, token]);

  /* ── derived ── */
  const trendingIds = trending.map((t) => t.productId);
  const isInList = (id) => trendingIds.includes(id);
  const isMax = trending.length >= MAX;

  /* ── actions ── */
  const add = (product) => {
    if (isInList(product.id) || isMax) return;
    setTrending((prev) => [
      ...prev,
      { productId: product.id, position: prev.length + 1, product },
    ]);
    setIsDirty(true);
  };

  const remove = (productId) => {
    setTrending((prev) =>
      prev
        .filter((t) => t.productId !== productId)
        .map((t, i) => ({ ...t, position: i + 1 }))
    );
    setIsDirty(true);
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    setTrending((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((t, i) => ({ ...t, position: i + 1 }));
    });
    setIsDirty(true);
  };

  const moveDown = (idx) => {
    setTrending((prev) => {
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next.map((t, i) => ({ ...t, position: i + 1 }));
    });
    setIsDirty(true);
  };

  const save = async () => {
    if (!token) return setErr("Not logged in. Please log in again.");
    setSaving(true);
    setErr("");
    try {
      const data = await adminSaveTrendingProducts(token, trendingIds);
      setTrending(data.items || []);
      setIsDirty(false);
      showToast("Trending products saved!", "success");
    } catch (e) {
      setErr(e.message || "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── helpers ── */
  const getImage = (product) => product?.images?.[0]?.url || null;
  const getPrice = (product) =>
    product?.variants?.length
      ? product.variants[0].price
      : product?.basePrice ?? 0;

  /* ── loading state ── */
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-1">Trending Products</h4>
          <div className="text-muted small">
            Select up to {MAX} products to feature on the homepage.
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          {isDirty && <span className="badge text-bg-warning">Unsaved changes</span>}
          <button
            className="btn btn-primary"
            onClick={save}
            disabled={saving || !isDirty}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving…
              </>
            ) : (
              "Save & Publish"
            )}
          </button>
        </div>
      </div>

      {/* Global error */}
      {err && <div className="alert alert-danger">{err}</div>}

      <div className="row g-3">
        {/* ── Left: catalog search ── */}
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white d-flex align-items-center justify-content-between py-3">
              <span className="fw-semibold">Product Catalog</span>
              {catalog.length > 0 && (
                <span className="badge text-bg-light border">{catalog.length} results</span>
              )}
            </div>
            <div className="card-body p-0">
              {/* Search input */}
              <div className="p-3 border-bottom">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 bg-light"
                    placeholder="Search by name or brand…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setQuery("")}
                    >
                      <i className="bi bi-x" />
                    </button>
                  )}
                </div>
              </div>

              {/* Product list */}
              <div style={{ maxHeight: 460, overflowY: "auto" }}>
                {catalog.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-search fs-2 d-block mb-2" />
                    {query ? "No products found" : "Type to search products"}
                  </div>
                ) : (
                  catalog.map((product) => {
                    const inList = isInList(product.id);
                    const img = getImage(product);
                    return (
                      <div
                        key={product.id}
                        className={`d-flex align-items-center gap-3 px-3 py-2 border-bottom ${
                          inList ? "bg-light" : ""
                        }`}
                      >
                        {/* Thumbnail */}
                        <div
                          className="rounded-2 overflow-hidden flex-shrink-0 bg-light d-flex align-items-center justify-content-center"
                          style={{ width: 44, height: 44 }}
                        >
                          {img ? (
                            <img
                              src={img}
                              alt={product.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <i className="bi bi-box-seam text-muted" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-grow-1 min-w-0">
                          <div
                            className="fw-semibold text-truncate"
                            style={{ fontSize: 13 }}
                            title={product.name}
                          >
                            {product.name}
                          </div>
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            {product.brand?.name}
                            {product.category?.name && (
                              <> &middot; {product.category.name}</>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="fw-semibold text-nowrap" style={{ fontSize: 13 }}>
                          NPR{getPrice(product).toLocaleString()}
                        </div>

                        {/* Add button */}
                        <button
                          className={`btn btn-sm ${
                            inList
                              ? "btn-success disabled"
                              : isMax
                              ? "btn-outline-secondary disabled"
                              : "btn-outline-primary"
                          }`}
                          style={{ minWidth: 36 }}
                          onClick={() => add(product)}
                          title={
                            inList
                              ? "Already in trending"
                              : isMax
                              ? "Max 6 reached"
                              : "Add to trending"
                          }
                        >
                          {inList ? (
                            <i className="bi bi-check-lg" />
                          ) : (
                            <i className="bi bi-plus-lg" />
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: trending list ── */}
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white d-flex align-items-center justify-content-between py-3">
              <span className="fw-semibold">Trending List</span>
              <span
                className={`badge ${
                  isMax ? "text-bg-warning" : "text-bg-light border"
                }`}
              >
                {trending.length} / {MAX}
              </span>
            </div>
            <div className="card-body p-0">
              {trending.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-stars fs-2 d-block mb-2" />
                  <div className="fw-semibold">No products added yet</div>
                  <div className="small">Search and add from the catalog</div>
                </div>
              ) : (
                <div style={{ maxHeight: 500, overflowY: "auto" }}>
                  {trending.map((item, idx) => {
                    const product = item.product;
                    const img = getImage(product);
                    return (
                      <div
                        key={item.productId}
                        className="d-flex align-items-center gap-3 px-3 py-2 border-bottom"
                      >
                        {/* Rank badge */}
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0 ${
                            idx < 3 ? "bg-warning text-dark" : "bg-light text-muted"
                          }`}
                          style={{ width: 28, height: 28, fontSize: 12 }}
                        >
                          {idx + 1}
                        </div>

                        {/* Thumbnail */}
                        <div
                          className="rounded-2 overflow-hidden flex-shrink-0 bg-light d-flex align-items-center justify-content-center"
                          style={{ width: 40, height: 40 }}
                        >
                          {img ? (
                            <img
                              src={img}
                              alt={product?.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <i className="bi bi-box-seam text-muted" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-grow-1 min-w-0">
                          <div
                            className="fw-semibold text-truncate"
                            style={{ fontSize: 13 }}
                          >
                            {product?.name}
                          </div>
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            {product?.brand?.name}
                          </div>
                        </div>

                        {/* Reorder buttons */}
                        <div className="d-flex flex-column gap-1">
                          <button
                            className="btn btn-sm btn-outline-secondary p-0 d-flex align-items-center justify-content-center"
                            style={{ width: 26, height: 26 }}
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0}
                            title="Move up"
                          >
                            <i className="bi bi-chevron-up" style={{ fontSize: 11 }} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary p-0 d-flex align-items-center justify-content-center"
                            style={{ width: 26, height: 26 }}
                            onClick={() => moveDown(idx)}
                            disabled={idx === trending.length - 1}
                            title="Move down"
                          >
                            <i className="bi bi-chevron-down" style={{ fontSize: 11 }} />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => remove(item.productId)}
                          title="Remove from trending"
                        >
                          <i className="bi bi-trash3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Max warning */}
              {isMax && (
                <div className="px-3 py-2 border-top bg-warning bg-opacity-10">
                  <small className="text-warning fw-semibold">
                    <i className="bi bi-exclamation-triangle me-1" />
                    Maximum {MAX} products reached
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`alert alert-${toast.type} position-fixed shadow d-flex align-items-center gap-2`}
          style={{ bottom: 24, right: 24, zIndex: 9999, minWidth: 240 }}
        >
          <i className={`bi ${toast.type === "success" ? "bi-check-circle" : "bi-x-circle"}`} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}