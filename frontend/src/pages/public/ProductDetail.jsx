import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_BASE = "/api";

function money(n) {
  return `NPR ${Number(n || 0).toLocaleString()}`;
}

function calcDiscountedPrice(price, type, value) {
  if (!type || value === null || value === undefined || value === 0) return price;
  if (type === "percent") return Math.max(0, Math.round(price - price * (Number(value) / 100)));
  if (type === "fixed" || type === "flat") return Math.max(0, Number(price) - Number(value));
  return price;
}

function safeJsonErrorMessage(data, fallback = "Request failed") {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  return fallback;
}

// Handles cases where server returns HTML error page (<!DOCTYPE ...>) instead of JSON
async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      (data && safeJsonErrorMessage(data)) ||
      (text?.startsWith("<!DOCTYPE") ? "Server returned HTML (check API base / nginx proxy / backend crash)" : "Request failed");
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  // If JSON parse failed but response is ok (rare), return null safely
  return data ?? {};
}

export default function ProductDetail() {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState("desc"); // desc | how | reviews
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [cartLoading, setCartLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 1) Load product by slug (no backend change: use search and match)
  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setErr("");
      setProduct(null);
      setRelated([]);
      setActiveImg(0);
      setSelectedVariantId("");
      setQty(1);

      try {
        // fetch list with q=slug (backend searches name/slug contains q)
        const params = new URLSearchParams();
        params.set("q", slug);
        params.set("page", "1");
        params.set("limit", "50"); // enough to find it

        const data = await fetchJson(`${API_BASE}/products?${params.toString()}`);
        const items = data.items || [];

        const found = items.find((p) => p.slug === slug) || null;

        if (!found) {
          if (!ignore) setErr("Product not found");
          return;
        }

        // If your list already includes images/variants it's enough.
        // But to be safe, we fetch full by id (includes images/variants/brand/category)
        const detail = await fetchJson(`${API_BASE}/products/${found.id}`);
        const full = detail.product || found;

        if (ignore) return;

        setProduct(full);

        // set default variant
        if (full?.variants?.length) setSelectedVariantId(full.variants[0].id);

        // Related products: same category if possible
        try {
          const relParams = new URLSearchParams();
          if (full.categoryId) relParams.set("categoryId", full.categoryId);
          relParams.set("page", "1");
          relParams.set("limit", "12");
          const rel = await fetchJson(`${API_BASE}/products?${relParams.toString()}`);
          const relItems = (rel.items || []).filter((x) => x.id !== full.id).slice(0, 6);
          setRelated(relItems);
        } catch {
          // ignore related failures
        }
      } catch (e) {
        if (!ignore) setErr(e.message || "Failed to load product");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [slug]);

  const hasVariants = !!product?.variants?.length;

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    if (!hasVariants) return null;
    return product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  }, [product, hasVariants, selectedVariantId]);

  const unitPrice = selectedVariant ? selectedVariant.price : product?.basePrice;
  const discounted = product
    ? calcDiscountedPrice(unitPrice, product.discountType, product.discountValue)
    : 0;

  const stock = selectedVariant ? selectedVariant.stock : product?.baseStock;
  const inStock = Number(stock || 0) > 0;
  const maxQty = Math.max(1, Math.min(Number(stock || 1), 20));

  // Helper: pick main image
  const imageUrls = useMemo(() => {
    if (!product) return [];
    // backend returns images: [{url, position, ...}]
    const imgs = product.images || [];
    return imgs.map((x) => x.url).filter(Boolean);
  }, [product]);

  const activeImageUrl = imageUrls[activeImg] || imageUrls[0] || "";

  // --- Guest cart helpers ---
  function getGuestCart() {
    try {
      return JSON.parse(localStorage.getItem("guest_cart") || "[]");
    } catch {
      return [];
    }
  }
  function setGuestCart(items) {
    localStorage.setItem("guest_cart", JSON.stringify(items));
  }
  function addToGuestCart({ productId, variantId, qty }) {
    const cart = getGuestCart();
    const key = `${productId}:${variantId || "base"}`;
    const idx = cart.findIndex((x) => x.key === key);

    if (idx >= 0) cart[idx].qty += qty;
    else cart.push({ key, productId, variantId: variantId || null, qty });

    setGuestCart(cart);
  }

  // --- Add to cart ---
  // FIX: tries the real API first (works for logged-in users whose token is in
  // the cookie / Authorization header). Falls back to the guest localStorage
  // cart when the server returns 401 (not authenticated).
  const onAddToCart = async () => {
    if (!product || !inStock || cartLoading) return;

    const safeQty = Math.min(qty, maxQty);
    const variantId = selectedVariant ? selectedVariant.id : null;

    setCartLoading(true);

    try {
      const body = {
        productId: product.id,
        quantity: safeQty,
        ...(variantId ? { variantId } : {}),
      };

      const token = localStorage.getItem("token");
      const data = await fetchJson(`${API_BASE}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const warning = data?.warning;
      setToast({
        msg: warning ? `Added to cart — ${warning}` : "Added to cart.",
        type: warning ? "warning" : "success",
      });
    } catch (e) {
      if (e.status === 401) {
        // Not logged in → fall back to guest cart
        addToGuestCart({ productId: product.id, variantId, qty: safeQty });
        setToast({ msg: "Added to cart (guest).", type: "success" });
      } else {
        // Real error from the server (stock issue, bad request, etc.)
        setToast({ msg: e.message || "Could not add to cart.", type: "danger" });
      }
    } finally {
      setCartLoading(false);
      window.setTimeout(() => setToast({ msg: "", type: "success" }), 2500);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="card card-soft p-4">Loading…</div>
      </div>
    );
  }

  if (err || !product) {
    return (
      <div className="container py-5">
        <div className="card card-soft p-4">
          <div className="fw-bold">{err || "Product not found"}</div>
          <div className="text-secondary mt-1">Please check the link or try again.</div>
          <div className="mt-3">
            <Link to="/products" className="btn btn-outline-secondary rounded-pill">
              Back to products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 py-md-5">
      {/* Breadcrumb */}
      <div className="d-flex flex-wrap align-items-center gap-2 text-secondary mb-3">
        <Link to="/" className="text-decoration-none" style={{ color: "var(--brand)" }}>
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="text-decoration-none" style={{ color: "var(--brand)" }}>
          Products
        </Link>
        <span>/</span>
        <span className="text-secondary">{product.name}</span>
      </div>

      <div className="row g-4">
        {/* Left: Gallery */}
        <div className="col-12 col-lg-6">
          <div className="card card-soft p-3">
            {/* Main image */}
            <div
              className="rounded-4"
              style={{
                height: 420,
                border: "1px solid rgba(15,23,42,.08)",
                background: "rgba(0,0,0,.04)",
                overflow: "hidden",
              }}
            >
              {activeImageUrl ? (
                <img
                  src={activeImageUrl}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    // fallback if image URL is broken
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="d-flex h-100 align-items-center justify-content-center text-secondary">
                  No image
                </div>
              )}
            </div>

            {/* Thumbs */}
            <div className="d-flex gap-2 mt-3 flex-wrap">
              {imageUrls.map((url, idx) => (
                <button
                  key={url + idx}
                  type="button"
                  className="btn p-0 border-0 bg-transparent"
                  onClick={() => setActiveImg(idx)}
                  aria-label={`thumbnail-${idx}`}
                >
                  <div
                    className="rounded-4"
                    style={{
                      height: 70,
                      width: 70,
                      border: activeImg === idx ? "2px solid var(--accent)" : "1px solid rgba(15,23,42,.08)",
                      opacity: activeImg === idx ? 1 : 0.85,
                      overflow: "hidden",
                      background: "rgba(0,0,0,.04)",
                    }}
                  >
                    <img src={url} alt="thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </button>
              ))}
            </div>

            {product.prescriptionRequired ? (
              <div className="alert alert-warning mt-3 mb-0">
                Prescription may be required for this product.
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: Info */}
        <div className="col-12 col-lg-6">
          <div className="d-flex align-items-start justify-content-between gap-2">
            <div>
              <h1 className="h3 fw-bold mb-1">{product.name}</h1>
              <div className="text-secondary">
                <Link
                  to={`/brands/${product.brand?.slug || ""}`}
                  className="text-decoration-none"
                  style={{ color: "var(--brand)" }}
                >
                  {product.brand?.name || "—"}
                </Link>
                <span className="mx-2">•</span>
                <span>{product.category?.name || "—"}</span>
              </div>

              <div className="d-flex align-items-center gap-2 mt-2">
                <span className="badge badge-soft rounded-pill px-3 py-2">
                  <i className="bi bi-star-fill me-1" style={{ color: "var(--accent)" }} />
                  {product.rating || 0} ({product.reviewCount || 0})
                </span>
                {inStock ? (
                  <span className="badge bg-success rounded-pill px-3 py-2">In stock</span>
                ) : (
                  <span className="badge bg-dark rounded-pill px-3 py-2">Out of stock</span>
                )}
              </div>
            </div>

            <button className="btn btn-light border rounded-pill" type="button" aria-label="wishlist">
              <i className="bi bi-heart" />
            </button>
          </div>

          {/* Price card */}
          <div className="card card-soft p-3 mt-3">
            <div className="d-flex align-items-end justify-content-between">
              <div>
                <div className="small text-secondary">Price</div>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <div className="fw-bold fs-4">{money(discounted)}</div>
                  {discounted !== unitPrice ? (
                    <div className="text-secondary text-decoration-line-through">{money(unitPrice)}</div>
                  ) : null}
                  {product.discountType && product.discountValue ? (
                    <span className="badge bg-danger rounded-pill px-3 py-2">
                      {product.discountType === "percent"
                        ? `${product.discountValue}% OFF`
                        : `${money(product.discountValue)} OFF`}
                    </span>
                  ) : null}
                </div>
                <div className="small text-secondary mt-1">
                  {hasVariants ? "Variant price may differ." : "Inclusive of all taxes."}
                </div>
              </div>

              <div className="text-end">
                <div className="small text-secondary">Available</div>
                <div className="fw-semibold">{stock || 0} units</div>
              </div>
            </div>

            {/* Variants */}
            {hasVariants ? (
              <div className="mt-3">
                <div className="small text-secondary mb-2">Select variant</div>
                <div className="d-flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const active = v.id === selectedVariant?.id;
                    const disabled = Number(v.stock || 0) <= 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        className={`btn btn-sm rounded-pill ${active ? "btn-brand" : "btn-outline-secondary"}`}
                        disabled={disabled}
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setQty(1);
                        }}
                      >
                        {v.name} {disabled ? "(Out)" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Quantity + Add */}
            <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center justify-content-between mt-3">
              <div className="d-flex align-items-center gap-2">
                <div className="small text-secondary me-2">Qty</div>
                <div className="btn-group" role="group" aria-label="quantity">
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setQty((x) => Math.max(1, x - 1))}
                    disabled={!inStock || cartLoading}
                  >
                    -
                  </button>
                  <button className="btn btn-outline-secondary" type="button" disabled>
                    {qty}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setQty((x) => Math.min(maxQty, x + 1))}
                    disabled={!inStock || cartLoading}
                  >
                    +
                  </button>
                </div>
                <div className="small text-secondary ms-2">Max {maxQty}</div>
              </div>

              <div className="d-flex gap-2">
                <Link to="/cart" className="btn btn-outline-secondary rounded-pill px-4">
                  Go to cart
                </Link>
                <button
                  className="btn btn-brand rounded-pill px-4"
                  type="button"
                  onClick={onAddToCart}
                  disabled={!inStock || cartLoading}
                >
                  {cartLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Adding…
                    </>
                  ) : (
                    "Add to cart"
                  )}
                </button>
              </div>
            </div>

            {toast.msg ? (
              <div className={`alert alert-${toast.type} mt-3 mb-0 py-2`}>{toast.msg}</div>
            ) : null}
          </div>

          {/* Tabs */}
          <div className="card card-soft p-3 mt-3">
            <div className="d-flex gap-2 flex-wrap">
              <button
                className={`btn btn-sm rounded-pill ${activeTab === "desc" ? "btn-brand" : "btn-outline-secondary"}`}
                type="button"
                onClick={() => setActiveTab("desc")}
              >
                Description
              </button>
              <button
                className={`btn btn-sm rounded-pill ${activeTab === "how" ? "btn-brand" : "btn-outline-secondary"}`}
                type="button"
                onClick={() => setActiveTab("how")}
              >
                How to use
              </button>
              <button
                className={`btn btn-sm rounded-pill ${activeTab === "reviews" ? "btn-brand" : "btn-outline-secondary"}`}
                type="button"
                onClick={() => setActiveTab("reviews")}
              >
                Reviews
              </button>
            </div>

            <div className="mt-3 text-secondary" style={{ lineHeight: 1.7 }}>
              {activeTab === "desc" ? (product.description || "—") : null}
              {activeTab === "how" ? (product.howToUse || "—") : null}
              {activeTab === "reviews" ? (
                <div className="text-secondary">Reviews will come from backend later.</div>
              ) : null}
            </div>
          </div>

          <div className="small text-secondary mt-3">
            Always read labels and follow usage instructions. If symptoms persist, consult a professional.
          </div>
        </div>
      </div>

      {/* Related products */}
      <section className="mt-5">
        <div className="d-flex align-items-end justify-content-between mb-3">
          <div>
            <h2 className="h5 fw-bold mb-1">Related products</h2>
            <div className="text-secondary">You may also like</div>
          </div>
          <Link to="/products" className="text-decoration-none" style={{ color: "var(--brand)" }}>
            View all <i className="bi bi-arrow-right" />
          </Link>
        </div>

        {related.length === 0 ? (
          <div className="card card-soft p-4 text-secondary">No related products yet.</div>
        ) : (
          <div className="row g-3">
            {related.map((p) => (
              <div className="col-6 col-md-4 col-lg-2" key={p.id}>
                <Link to={`/products/${p.slug}`} className="text-decoration-none">
                  <div className="card card-soft h-100 overflow-hidden">
                    <div style={{ height: 110, background: "rgba(0,0,0,.04)" }}>
                      {p.images?.[0]?.url ? (
                        <img
                          src={p.images[0].url}
                          alt={p.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : null}
                    </div>
                    <div className="p-2">
                      <div className="fw-semibold text-dark" style={{ fontSize: 13, minHeight: 34 }}>
                        {p.name}
                      </div>
                      <div className="small text-secondary">
                        {money(calcDiscountedPrice(p.basePrice, p.discountType, p.discountValue))}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}