import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

const demoProducts = [
  {
    id: "p1",
    slug: "spf-50-sunscreen",
    name: "SPF 50 Sunscreen",
    brand: { name: "Bioderma", slug: "bioderma" },
    category: { name: "Skincare", slug: "skincare" },
    rating: 4.8,
    reviewCount: 128,
    prescriptionRequired: false,
    description:
      "Lightweight broad-spectrum sunscreen for daily use. Non-greasy finish and suitable for sensitive skin.",
    howToUse:
      "Apply generously 15 minutes before sun exposure. Reapply every 2 hours or after sweating/swimming.",
    images: [
      "img1",
      "img2",
      "img3",
      "img4",
    ],
    basePrice: 1499,
    discountType: "percent",
    discountValue: 20,
    baseStock: 24,
    variants: [
      { id: "v1", name: "50ml", price: 1499, stock: 10 },
      { id: "v2", name: "100ml", price: 2199, stock: 14 },
    ],
  },
  {
    id: "p2",
    slug: "ceramide-moisturizer",
    name: "Ceramide Moisturizer",
    brand: { name: "CeraVe", slug: "cerave" },
    category: { name: "Skincare", slug: "skincare" },
    rating: 4.6,
    reviewCount: 84,
    prescriptionRequired: false,
    description:
      "Barrier-repair moisturizer with ceramides. Supports hydration and helps reduce dryness.",
    howToUse:
      "Apply evenly to face/body after cleansing. Use morning and night for best results.",
    images: ["img1", "img2", "img3"],
    basePrice: 1599,
    discountType: "fixed",
    discountValue: 200,
    baseStock: 18,
    variants: [],
  },
];

function money(n) {
  return `NPR ${Number(n || 0).toLocaleString()}`;
}

function calcDiscountedPrice(price, type, value) {
  if (!type || !value) return price;
  if (type === "percent") return Math.max(0, Math.round(price - price * (value / 100)));
  if (type === "fixed") return Math.max(0, price - value);
  return price;
}

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

  if (idx >= 0) {
    cart[idx].qty += qty;
  } else {
    cart.push({ key, productId, variantId: variantId || null, qty });
  }

  setGuestCart(cart);
  return cart;
}

function ImagePlaceholder({ active = false }) {
  return (
    <div
      className="img-ph rounded-4"
      style={{
        height: 420,
        border: active ? "2px solid var(--accent)" : "1px solid rgba(15,23,42,.08)",
      }}
    />
  );
}

function ThumbPlaceholder({ active = false }) {
  return (
    <div
      className="img-ph rounded-4"
      style={{
        height: 70,
        width: 70,
        border: active ? "2px solid var(--accent)" : "1px solid rgba(15,23,42,.08)",
        opacity: active ? 1 : 0.85,
      }}
    />
  );
}

export default function ProductDetail() {
  const { slug } = useParams();

  const product = useMemo(() => demoProducts.find((p) => p.slug === slug), [slug]);

  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState("desc"); // desc | how | reviews
  const [selectedVariantId, setSelectedVariantId] = useState(product?.variants?.[0]?.id || "");
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState("");

  if (!product) {
    return (
      <div className="container py-5">
        <div className="card card-soft p-4">
          <div className="fw-bold">Product not found</div>
          <div className="text-secondary mt-1">This product does not exist.</div>
          <div className="mt-3">
            <Link to="/products" className="btn btn-outline-secondary rounded-pill">
              Back to products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasVariants = (product.variants || []).length > 0;
  const selectedVariant = hasVariants
    ? product.variants.find((v) => v.id === selectedVariantId) || product.variants[0]
    : null;

  const unitPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const discounted = calcDiscountedPrice(unitPrice, product.discountType, product.discountValue);

  const stock = selectedVariant ? selectedVariant.stock : product.baseStock;
  const inStock = stock > 0;

  const maxQty = Math.max(1, Math.min(stock || 1, 20));

  const related = demoProducts.filter((p) => p.slug !== product.slug).slice(0, 6);

  const onAddToCart = () => {
    if (!inStock) return;

    const safeQty = Math.min(qty, maxQty);
    addToGuestCart({
      productId: product.id,
      variantId: selectedVariant ? selectedVariant.id : null,
      qty: safeQty,
    });

    setToast("Added to cart.");
    window.setTimeout(() => setToast(""), 1800);
  };

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
            <ImagePlaceholder active />

            <div className="d-flex gap-2 mt-3 flex-wrap">
              {(product.images || []).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn p-0 border-0 bg-transparent"
                  onClick={() => setActiveImg(idx)}
                  aria-label={`thumbnail-${idx}`}
                >
                  <ThumbPlaceholder active={activeImg === idx} />
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
                <Link to={`/brands/${product.brand.slug}`} className="text-decoration-none" style={{ color: "var(--brand)" }}>
                  {product.brand.name}
                </Link>
                <span className="mx-2">•</span>
                <span>{product.category.name}</span>
              </div>

              <div className="d-flex align-items-center gap-2 mt-2">
                <span className="badge badge-soft rounded-pill px-3 py-2">
                  <i className="bi bi-star-fill me-1" style={{ color: "var(--accent)" }} />
                  {product.rating} ({product.reviewCount})
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
                <div className="fw-semibold">{stock} units</div>
              </div>
            </div>

            {/* Variants */}
            {hasVariants ? (
              <div className="mt-3">
                <div className="small text-secondary mb-2">Select size</div>
                <div className="d-flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const active = v.id === selectedVariant.id;
                    const disabled = v.stock <= 0;
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
                    disabled={!inStock}
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
                    disabled={!inStock}
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
                <button className="btn btn-brand rounded-pill px-4" type="button" onClick={onAddToCart} disabled={!inStock}>
                  Add to cart
                </button>
              </div>
            </div>

            {toast ? (
              <div className="alert alert-success mt-3 mb-0 py-2">{toast}</div>
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
              {activeTab === "desc" ? product.description : null}
              {activeTab === "how" ? product.howToUse : null}
              {activeTab === "reviews" ? (
                <div>
                  <div className="fw-semibold text-dark">Top reviews</div>
                  <div className="mt-2">
                    <div className="p-3 rounded-4" style={{ border: "1px solid rgba(15,23,42,.08)" }}>
                      <div className="d-flex justify-content-between">
                        <div className="fw-semibold text-dark">Asha</div>
                        <div className="small text-secondary">
                          <i className="bi bi-star-fill me-1" style={{ color: "var(--accent)" }} />
                          5.0
                        </div>
                      </div>
                      <div className="small text-secondary mt-2">
                        Great texture, not sticky. Works well under makeup.
                      </div>
                    </div>

                    <div className="p-3 rounded-4 mt-2" style={{ border: "1px solid rgba(15,23,42,.08)" }}>
                      <div className="d-flex justify-content-between">
                        <div className="fw-semibold text-dark">Ramesh</div>
                        <div className="small text-secondary">
                          <i className="bi bi-star-fill me-1" style={{ color: "var(--accent)" }} />
                          4.5
                        </div>
                      </div>
                      <div className="small text-secondary mt-2">
                        Good protection. Wish the bottle was bigger.
                      </div>
                    </div>
                  </div>

                  <div className="small text-secondary mt-3">
                    Reviews will come from backend later (only verified buyers can post).
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Safety note */}
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

        <div className="row g-3">
          {related.map((p) => (
            <div className="col-6 col-md-4 col-lg-2" key={p.slug}>
              <Link to={`/products/${p.slug}`} className="text-decoration-none">
                <div className="card card-soft h-100 overflow-hidden">
                  <div className="img-ph" style={{ height: 110 }} />
                  <div className="p-2">
                    <div className="fw-semibold text-dark" style={{ fontSize: 13, minHeight: 34 }}>
                      {p.name}
                    </div>
                    <div className="small text-secondary">{money(calcDiscountedPrice(p.basePrice, p.discountType, p.discountValue))}</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
