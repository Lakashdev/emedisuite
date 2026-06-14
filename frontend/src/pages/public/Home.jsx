import { Link } from "react-router-dom";
import { useRef, useState, useEffect, useMemo } from "react";
import { getPublicTrendingProducts } from "../../api/trendingProducts";
import { resolveAssetUrl } from "../../utils/assetUrl";
import { getEffectivePrice } from "../../utils/money";
import { notifyCartUpdated } from "../../utils/cartEvents";




/* ─── API BASE ─── */
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

/* ─── BRAND TOKENS ─── */
// Navy: #1B3D6E   Green: #6BBF4E   Light green: #E8F5E2   Light navy: #EEF2F8

/* ─── DATA ─── */

async function fetchHeroSlides() {
  const res = await fetch(`${API_BASE}/hero-slides`);
  if (!res.ok) throw new Error("Failed to fetch hero slides");
  return res.json();
}


/* Retained for the Curated bundles section.
const bundles = [
  {
    id: 1,
    title: "Morning Glow Ritual",
    desc: "Cleanser + Vitamin C + SPF 50",
    items: 3,
    price: 2799,
    oldPrice: 3697,
    off: 24,
    color: "#1B3D6E",
    bg: "linear-gradient(135deg, #EEF2F8, #DDE6F3)",
    icon: "bi-brightness-high",
  },
  {
    id: 2,
    title: "Hydration Power Pack",
    desc: "Hyaluronic Acid + Ceramide + Gel Moisturizer",
    items: 3,
    price: 3499,
    oldPrice: 4597,
    off: 24,
    color: "#6BBF4E",
    bg: "linear-gradient(135deg, #E8F5E2, #D4EEC9)",
    icon: "bi-droplet-half",
  },
  {
    id: 3,
    title: "Baby Soft Starter Kit",
    desc: "Baby Wash + Lotion + Wipes + Diaper Cream",
    items: 4,
    price: 1999,
    oldPrice: 2796,
    off: 29,
    color: "#1B3D6E",
    bg: "linear-gradient(135deg, #EEF2F8, #DDE6F3)",
    icon: "bi-emoji-smile",
  },
  {
    id: 4,
    title: "Night Repair Ritual",
    desc: "Retinol + Peptide Serum + Rich Night Cream",
    items: 3,
    price: 3999,
    oldPrice: 5497,
    off: 27,
    color: "#6BBF4E",
    bg: "linear-gradient(135deg, #E8F5E2, #D4EEC9)",
    icon: "bi-moon-stars",
  },
];
*/

/* Retained for the Shop by health concern section.
const healthConcerns = [
  { title: "Full Body Check", icon: "bi-activity", href: "/labs?concern=full-body", sub: "Comprehensive" },
  { title: "Diabetes Care", icon: "bi-droplet-half", href: "/labs?concern=diabetes", sub: "Monitor & manage" },
  { title: "Women's Health", icon: "bi-heart", href: "/products?category=women-care", sub: "Hormonal balance" },
  { title: "Thyroid Panel", icon: "bi-clipboard2-pulse", href: "/labs?concern=thyroid", sub: "T3, T4, TSH" },
  { title: "Bone & Joint", icon: "bi-universal-access", href: "/products?category=supplements", sub: "Vitamin D, Calcium" },
  { title: "Gut Health", icon: "bi-heart-pulse", href: "/products?category=wellness", sub: "Probiotics & more" },
];
*/

/* ─── API HELPERS ─── */
async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }
  return res.json();
}

async function fetchBestSellers() {
  const res = await fetch(`${API_BASE}/products/best-sellers?limit=16`);
  if (!res.ok) throw new Error("Failed to fetch best sellers");
  return res.json();
}

async function fetchNewArrivals() {
  const res = await fetch(`${API_BASE}/products?status=active&limit=8&page=1`);
  if (!res.ok) throw new Error("Failed to fetch new arrivals");
  return res.json();
}

function shapeProduct(product) {
  const pricing = getEffectivePrice(product);
  const hasDiscount = pricing.originalPrice !== null && pricing.price !== pricing.originalPrice;

  return {
    ...product,
    brand: product.brand?.name || "",
    price: pricing.price,
    oldPrice: hasDiscount ? pricing.originalPrice : null,
    off: hasDiscount ? pricing.discountPct : null,
    rating: 4.8,
    reviews: 0,
    image: resolveAssetUrl(product.images?.[0]?.url),
  };
}
/* export async function getPublicTrendingProducts() {
  const res = await fetch("/api/trending-products");

  if (!res.ok) {
    throw new Error("Failed to fetch trending products");
  }

  return res.json();
} */



function getCategoryIcon(slug = "", name = "") {
  const key = `${slug} ${name}`.toLowerCase();

  if (key.includes("skin")) return "bi-stars";
  if (key.includes("sun")) return "bi-sun";
  if (key.includes("hair")) return "bi-droplet";
  if (key.includes("baby")) return "bi-emoji-smile";
  if (key.includes("vitamin")) return "bi-capsule";
  if (key.includes("wellness")) return "bi-heart-pulse";
  if (key.includes("first-aid") || key.includes("first aid")) return "bi-bandaid";
  if (key.includes("personal")) return "bi-person-heart";
  if (key.includes("medicine") || key.includes("pharma")) return "bi-capsule-pill";
  return "bi-grid";
}

function getCategoryColor(index) {
  const palette = [
    { color: "#1B3D6E", bg: "#EEF2F8" },
    { color: "#6BBF4E", bg: "#E8F5E2" },
  ];
  return palette[index % palette.length];
}

/* ─── UTILITIES ─── */
function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ color: "#F59E0B", fontSize: 11 }}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

/* ─── PRODUCT CARD ─── */
function addToGuestCart({ productId, variantId }) {
  let cart = [];

  try {
    const saved = JSON.parse(localStorage.getItem("guest_cart") || "[]");
    cart = Array.isArray(saved) ? saved : [];
  } catch {
    cart = [];
  }

  const key = `${productId}:${variantId || "base"}`;
  const existing = cart.find((item) => item.key === key);

  if (existing) {
    existing.qty = Number(existing.qty || existing.quantity || 0) + 1;
  } else {
    cart.push({ key, productId, variantId: variantId || null, qty: 1 });
  }

  localStorage.setItem("guest_cart", JSON.stringify(cart));
  notifyCartUpdated();
}

async function addProductToCart(product) {
  const variants = product.variants || [];
  const variant = variants.find((item) => Number(item.stock || 0) > 0);
  const inStock = variants.length
    ? Boolean(variant)
    : Number(product.baseStock || 0) > 0;

  if (!inStock) throw new Error("Out of stock");

  const body = {
    productId: product.id,
    quantity: 1,
    ...(variant ? { variantId: variant.id } : {}),
  };
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/cart/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    addToGuestCart({ productId: product.id, variantId: variant?.id });
    return;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Could not add to cart");

  notifyCartUpdated();
}

function ProductCard({ p, compact = false }) {
  const [cartState, setCartState] = useState("idle");
  const variants = p.variants || [];
  const inStock = variants.length
    ? variants.some((item) => Number(item.stock || 0) > 0)
    : Number(p.baseStock || 0) > 0;

  async function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || cartState === "loading") return;

    setCartState("loading");
    try {
      await addProductToCart(p);
      setCartState("added");
    } catch {
      setCartState("error");
    }

    window.setTimeout(() => setCartState("idle"), 1800);
  }

  return (
    <Link
      to={`/products/${p.slug || p.id}`}
      className={`text-decoration-none product-card-link${compact ? " product-card-link-compact" : ""}`}
    >
      <div className={`product-card${compact ? " product-card-compact" : ""}`}>
        <div className="product-img-wrap">
          {p.off ? <span className="discount-badge">{p.off}% OFF</span> : null}

          {p.image ? (
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <div className="product-img-ph" />
          )}
        </div>

        <div className="product-body">
          <div className="product-brand">{p.brand || "Medisuite"}</div>
          <div className="product-name">{p.name}</div>
          <div className="product-meta">
            <Stars rating={p.rating || 4.8} />
            <span className="review-count">
              ({(p.reviews || 0).toLocaleString()})
            </span>
          </div>
          <div className="product-price-row">
            <span className="product-price">
              NPR {(p.price || 0).toLocaleString()}
            </span>
            {p.oldPrice ? (
              <span className="product-old">
                NPR {p.oldPrice.toLocaleString()}
              </span>
            ) : null}
          </div>
          <button
            className={`add-btn ${cartState === "added" ? "added" : ""} ${cartState === "error" ? "cart-error" : ""}`}
            onClick={handleAdd}
            type="button"
            disabled={!inStock || cartState === "loading"}
          >
            {!inStock ? (
              "Out of stock"
            ) : cartState === "loading" ? (
              <>
                <i className="bi bi-arrow-repeat cart-spin" /> Adding...
              </>
            ) : cartState === "added" ? (
              <>
                <i className="bi bi-check2" /> Added
              </>
            ) : cartState === "error" ? (
              "Try again"
            ) : (
              "Add to cart"
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ─── HORIZONTAL SCROLL ROW ─── */
function ScrollRow({ items, renderItem }) {
  const ref = useRef(null);
  const scroll = (dx) => ref.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <div className="scroll-row-wrap">
      <button className="scroll-btn scroll-btn-left" type="button" onClick={() => scroll(-460)} aria-label="prev">
        <i className="bi bi-chevron-left" />
      </button>
      <div className="scroll-row" ref={ref}>
        {items.map(renderItem)}
      </div>
      <button className="scroll-btn scroll-btn-right" type="button" onClick={() => scroll(460)} aria-label="next">
        <i className="bi bi-chevron-right" />
      </button>
    </div>
  );
}

/* ─── SECTION HEADER ─── */
function SecHead({ title, sub, href, action = "View all" }) {
  return (
    <div className="sec-head">
      <div>
        <h2 className="sec-title">{title}</h2>
        {sub && <p className="sec-sub">{sub}</p>}
      </div>
      <Link to={href} className="sec-link">
        {action} <i className="bi bi-arrow-right" />
      </Link>
    </div>
  );
}

/* ─── TRUST BAR ─── */
function TrustBar() {
  const items = [
    { icon: "bi-shield-fill-check", text: "100% Genuine Products" },
    { icon: "bi-truck", text: "Fast COD Delivery" },
    { icon: "bi-award", text: "Licensed Pharmacy" },
    { icon: "bi-headset", text: "Expert Support 24/7" },
    { icon: "bi-arrow-counterclockwise", text: "Easy Returns" },
  ];

  return (
    <div className="trust-bar">
      <div className="trust-bar-inner container">
        {items.map((item, i) => (
          <div key={i} className="trust-bar-item">
            <i className={`bi ${item.icon} trust-bar-icon`} />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── HERO ─── */
export function Hero() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
 
  // Fetch slides from backend
  useEffect(() => {
    let ignore = false;
    fetchHeroSlides()
      .then((data) => {
        if (!ignore) setSlides(Array.isArray(data?.items) ? data.items : []);
      })
      .catch(() => {
        // silently fall back to empty — hero just won't render
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, []);
 
  // Auto-advance
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setActive((x) => (x + 1) % slides.length);
        setAnimating(false);
      }, 300);
    }, 5000);
    return () => clearInterval(t);
  }, [slides.length]);
 
  function goTo(i) {
    setAnimating(true);
    setTimeout(() => { setActive(i); setAnimating(false); }, 300);
  }
 
  if (loading) {
    return (
      <section className="hero" style={{ background: "linear-gradient(135deg, #E8F5E2 0%, #EEF2F8 100%)", minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#6BBF4E", fontSize: 15 }}>
          <i className="bi bi-arrow-repeat me-2" style={{ animation: "spin 1s linear infinite" }} />
          Loading…
        </div>
      </section>
    );
  }
 
  if (!slides.length) return null;
 
  const s = slides[active];
 
  // Compute discount % from backend data
  const discountPct = s.featOld && s.featPrice
    ? Math.round((1 - s.featPrice / s.featOld) * 100)
    : 0;
 
  return (
    <section className="hero" style={{ background: s.bg }}>
      <div className="hero-geo hero-geo-1" style={{ background: `${s.accent}12` }} />
      <div className="hero-geo hero-geo-2" style={{ background: `#1B3D6E08` }} />
 
      <div className={`hero-inner container ${animating ? "hero-fade-out" : "hero-fade-in"}`}>
        {/* ── LEFT TEXT ── */}
        <div className="hero-text">
          <span
            className="hero-pill"
            style={{ color: s.accent, background: `${s.accent}18`, borderColor: `${s.accent}30` }}
          >
            <i className="bi bi-tag-fill me-1" style={{ fontSize: 10 }} />
            {s.tag}
          </span>
 
          <h1 className="hero-h1">
            {s.headline.split("\\n").map((ln, i) => (
              <span key={i} className={i === 1 ? "hero-h1-accent" : ""}>
                {ln}
                <br />
              </span>
            ))}
          </h1>
 
          <p className="hero-sub">{s.sub}</p>
 
          {s.pill && (
            <div
              className="hero-offer"
              style={{ color: s.accent, borderColor: `${s.accent}30`, background: `${s.accent}0d` }}
            >
              <i className="bi bi-percent me-1" />
              {s.pill}
            </div>
          )}
 
          <div className="hero-ctas">
            <Link to={s.ctaHref} className="btn-primary-brand">
              {s.ctaLabel} <i className="bi bi-arrow-right ms-1" />
            </Link>
            <Link to={s.ctaAltHref} className="btn-ghost-brand">
              {s.ctaAltLabel}
            </Link>
          </div>
 
          <div className="hero-micro-trust">
            <span className="hero-micro">
              <i className="bi bi-shield-fill-check" /> {s.micro1}
            </span>
            <span className="hero-micro">
              <i className="bi bi-geo-alt-fill" /> {s.micro2}
            </span>
            <span className="hero-micro">
              <i className="bi bi-award-fill" /> {s.micro3}
            </span>
          </div>
        </div>
 
        {/* ── RIGHT CARD ── */}
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-img">
              {/* If slide is linked to a real product with an image, show it */}
              {s.product?.images?.[0]?.url ? (
                <img
                  src={resolveAssetUrl(s.product.images[0].url)}
                  alt={s.featName}
                  className="hero-card-product-img"
                />
              ) : (
                <div className="hero-card-img-bg" style={{ background: `${s.accent}14` }}>
                  <i className={`bi ${s.icon} hero-card-icon`} style={{ color: s.accent }} />
                </div>
              )}
              <div className="hero-card-badge" style={{ background: s.accent }}>
                <i className="bi bi-star-fill me-1" style={{ fontSize: 9 }} />
                Featured
              </div>
            </div>
            <div className="hero-card-body">
              <div className="hero-card-label" style={{ color: "#1B3D6E" }}>
                <i className="bi bi-patch-check-fill me-1" style={{ color: "#6BBF4E" }} />
                Medisuite Pick
              </div>
              <div className="hero-card-name">{s.featName}</div>
              <div className="hero-card-rating">
                <Stars rating={4.8} />
                <span style={{ fontSize: 12, color: "#64748b" }}>4.8 · 2.3k reviews</span>
              </div>
              <div className="hero-card-price-row">
                <span className="hero-card-price">NPR {s.featPrice.toLocaleString()}</span>
                <span className="hero-card-old">NPR {s.featOld.toLocaleString()}</span>
                {discountPct > 0 && (
                  <span className="hero-card-off" style={{ background: "#6BBF4E15", color: "#6BBF4E" }}>
                    {discountPct}% off
                  </span>
                )}
              </div>
              {s.product ? (
                <Link to={`/products/${s.product.slug}`} className="hero-card-btn" style={{ textDecoration: "none", display: "block", textAlign: "center" }}>
                  <i className="bi bi-cart-plus me-1" />
                  Add to cart
                </Link>
              ) : (
                <button className="hero-card-btn">
                  <i className="bi bi-cart-plus me-1" />
                  Add to cart
                </button>
              )}
            </div>
          </div>
 
          <div className="hero-stat-cards">
            <div className="hero-stat-card hero-stat-card-1">
              <div className="hero-stat-icon" style={{ background: "#1B3D6E15", color: "#1B3D6E" }}>
                <i className="bi bi-shield-check" />
              </div>
              <div>
                <div className="hero-stat-val">{s.stat1Val}</div>
                <div className="hero-stat-label">{s.stat1Label}</div>
              </div>
            </div>
            <div className="hero-stat-card hero-stat-card-2">
              <div className="hero-stat-icon" style={{ background: "#6BBF4E15", color: "#6BBF4E" }}>
                <i className="bi bi-truck" />
              </div>
              <div>
                <div className="hero-stat-val">{s.stat2Val}</div>
                <div className="hero-stat-label">{s.stat2Label}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Dots */}
      {slides.length > 1 && (
        <div className="hero-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === active ? "active" : ""}`}
              onClick={() => goTo(i)}
              type="button"
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
/* ─── MAIN ─── */
export default function Home() {
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState("");

  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState("");
  const [bestSellers, setBestSellers] = useState([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);
  const [bestSellersError, setBestSellersError] = useState("");
  const [newArrivals, setNewArrivals] = useState([]);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);
  const [newArrivalsError, setNewArrivalsError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      try {
        setCatLoading(true);
        setCatError("");

        const data = await fetchCategories();

        if (ignore) return;

        setCategories(Array.isArray(data?.items) ? data.items : []);
      } catch (err) {
        if (ignore) return;
        setCatError(err.message || "Failed to load categories");
      } finally {
        if (!ignore) setCatLoading(false);
      }
    }

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadTrending() {
      try {
        setTrendingLoading(true);
        setTrendingError("");

        const data = await getPublicTrendingProducts();

        if (ignore) return;

        const raw = Array.isArray(data?.products) ? data.products : [];
        const shaped = raw.map(shapeProduct);
        setTrending(shaped);
      } catch (err) {
        if (ignore) return;
        setTrendingError(err.message || "Failed to load trending products");
      } finally {
        if (!ignore) setTrendingLoading(false);
      }
    }

    loadTrending();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadNewArrivals() {
      try {
        setNewArrivalsLoading(true);
        setNewArrivalsError("");
        const data = await fetchNewArrivals();
        if (!ignore) setNewArrivals((data.items || []).map(shapeProduct));
      } catch (err) {
        if (!ignore) setNewArrivalsError(err.message || "Failed to load new arrivals");
      } finally {
        if (!ignore) setNewArrivalsLoading(false);
      }
    }

    loadNewArrivals();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadBestSellers() {
      try {
        setBestSellersLoading(true);
        setBestSellersError("");
        const data = await fetchBestSellers();
        if (!ignore) setBestSellers((data.items || []).map(shapeProduct));
      } catch (err) {
        if (!ignore) setBestSellersError(err.message || "Failed to load best sellers");
      } finally {
        if (!ignore) setBestSellersLoading(false);
      }
    }

    loadBestSellers();
    return () => { ignore = true; };
  }, []);

  const displayCategories = useMemo(() => {
    return categories
      .filter((c) => c.status === "active" && !c.parent)
      .map((c, index) => {
        const palette = getCategoryColor(index);
        return {
          ...c,
          href: `/products?category=${encodeURIComponent(c.slug)}`,
          icon: getCategoryIcon(c.slug, c.name),
          color: palette.color,
          bg: palette.bg,
          count:
            c.children?.length > 0
              ? `${c.children.length} subcategories`
              : "Explore category",
        };
      })
      .slice(0, 12);
  }, [categories]);

  return (
    <div className="home-root">
      <style>{CSS}</style>

      <TrustBar />
      <Hero />

      {/* TRENDING */}
      <section className="section section-alt">
        <div className="container">
          <SecHead
            title="Trending now"
            sub="What everyone's adding to cart this week."
            href="/products"
          />

          {trendingLoading ? (
            <div className="home-alert-empty">Loading trending products...</div>
          ) : trendingError ? (
            <div className="home-alert-error">{trendingError}</div>
          ) : trending.length === 0 ? (
            <div className="home-alert-empty">No trending products found.</div>
          ) : (
            <ScrollRow
              items={trending}
              renderItem={(p) => <ProductCard key={p.id} p={p} />}
            />
          )}
        </div>
      </section>

      {/* Retained for future reuse.
      <section className="section bundles-section">
        <div className="container">
          <SecHead
            title="Curated bundles"
            sub="Better together — save more with expert-curated kits."
            href="/products"
            action="See all bundles"
          />
          <div className="bundle-grid">
            {bundles.map((b) => (
              <Link key={b.id} to="/products" className="text-decoration-none">
                <div className="bundle-card" style={{ background: b.bg }}>
                  <div className="bundle-top">
                    <div
                      className="bundle-icon-wrap"
                      style={{ background: `${b.color}18`, color: b.color }}
                    >
                      <i className={`bi ${b.icon}`} />
                    </div>
                    <span
                      className="bundle-save"
                      style={{
                        color: b.color,
                        background: `${b.color}15`,
                        border: `1px solid ${b.color}25`,
                      }}
                    >
                      Save {b.off}%
                    </span>
                  </div>
                  <div className="bundle-title">{b.title}</div>
                  <div className="bundle-desc">{b.desc}</div>
                  <div className="bundle-items-note" style={{ color: b.color }}>
                    <i className="bi bi-box-seam me-1" />
                    {b.items} products included
                  </div>
                  <div className="bundle-price-row">
                    <span className="bundle-price">
                      NPR {b.price.toLocaleString()}
                    </span>
                    <span className="bundle-old">
                      NPR {b.oldPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="bundle-cta" style={{ background: b.color }}>
                    Shop bundle <i className="bi bi-arrow-right ms-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* BEST SELLERS */}
      <section className="section container">
        <SecHead
          title="Best sellers"
          sub="Tried, trusted, and loved by thousands."
          href="/products"
        />
        {bestSellersLoading ? (
          <div className="home-alert-empty">Loading best sellers...</div>
        ) : bestSellersError ? (
          <div className="home-alert-error">{bestSellersError}</div>
        ) : bestSellers.length === 0 ? (
          <div className="home-alert-empty">No best sellers found.</div>
        ) : (
          <div className="best-sellers-grid">
            {bestSellers.slice(0, 16).map((p) => (
              <ProductCard key={p.id} p={p} compact />
            ))}
          </div>
        )}
      </section>

      {/* Retained for future reuse.
      <section className="section concern-section">
        <div className="container">
          <SecHead
            title="Shop by health concern"
            sub="Find the right products for your specific needs."
            href="/products"
          />
          <div className="concern-grid">
            {healthConcerns.map((c) => (
              <Link key={c.title} to={c.href} className="text-decoration-none">
                <div className="concern-card">
                  <div className="concern-icon-wrap">
                    <i className={`bi ${c.icon} concern-icon`} />
                  </div>
                  <div>
                    <div className="concern-title">{c.title}</div>
                    <div className="concern-sub">{c.sub}</div>
                  </div>
                  <i className="bi bi-arrow-right concern-arrow" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* NEW ARRIVALS */}
      <section className="section section-alt">
        <div className="container">
          <SecHead
            title="New arrivals"
            sub="Fresh formulas and innovations just landed."
            href="/products"
          />
          {newArrivalsLoading ? (
            <div className="home-alert-empty">Loading new arrivals...</div>
          ) : newArrivalsError ? (
            <div className="home-alert-error">{newArrivalsError}</div>
          ) : newArrivals.length === 0 ? (
            <div className="home-alert-empty">No new arrivals found.</div>
          ) : (
            <ScrollRow
              items={newArrivals}
              renderItem={(p) => <ProductCard key={p.id} p={p} />}
            />
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section container">
        <SecHead
          title="Shop by category"
          sub="Find what your skin, body & family needs."
          href="/products"
        />

        {catLoading ? (
          <div className="cat-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="cat-card cat-skeleton">
                <div className="cat-icon-wrap skeleton-box" />
                <div className="skeleton-line skeleton-line-lg" />
                <div className="skeleton-line skeleton-line-sm" />
              </div>
            ))}
          </div>
        ) : catError ? (
          <div className="home-alert-error">
            Could not load categories right now.
          </div>
        ) : displayCategories.length === 0 ? (
          <div className="home-alert-empty">
            No active categories found.
          </div>
        ) : (
          <div className="cat-grid">
            {displayCategories.map((c) => (
              <Link key={c.id} to={c.href} className="text-decoration-none">
                <div
                  className="cat-card"
                  style={{ "--cat-color": c.color, "--cat-bg": c.bg }}
                >
                  <div className="cat-icon-wrap">
                    <i className={`bi ${c.icon} cat-icon`} />
                  </div>
                  <div className="cat-title">{c.name}</div>
                  <div className="cat-count">{c.count}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* TRUST + NEWSLETTER */}
      <section className="section trust-section">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-left">
              <div className="trust-eyebrow">
                <span className="trust-eyebrow-line" />
                Why Medisuite Pharmacy
              </div>
              <h2 className="trust-title">
                Wellness you can
                <br />
                count on.
              </h2>
              <p className="trust-body">
                Every product is verified, every brand is trusted. We bring you
                clean, effective wellness without compromise — delivered right to
                your door.
              </p>
              <div className="trust-feats">
                {[
                  {
                    icon: "bi-shield-fill-check",
                    title: "Genuine products",
                    sub: "Verified directly from brands",
                  },
                  {
                    icon: "bi-truck",
                    title: "Fast COD delivery",
                    sub: "Ring road & beyond",
                  },
                  {
                    icon: "bi-arrow-counterclockwise",
                    title: "Easy returns",
                    sub: "Hassle-free policy",
                  },
                  {
                    icon: "bi-headset",
                    title: "Expert support",
                    sub: "Chat or call anytime",
                  },
                ].map((f) => (
                  <div key={f.title} className="trust-feat">
                    <div className="trust-feat-icon">
                      <i className={`bi ${f.icon}`} />
                    </div>
                    <div>
                      <div className="trust-feat-title">{f.title}</div>
                      <div className="trust-feat-sub">{f.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="trust-right">
              <div className="newsletter-card">
                <div className="nl-icon-row">
                  <div className="nl-brand-mark">
                    <i className="bi bi-capsule" />
                    <span>Medisuite</span>
                  </div>
                </div>
                <div className="nl-tag">Stay in the know</div>
                <div className="nl-title">
                  Offers, routines &amp; wellness tips
                </div>
                <div className="nl-sub">
                  Weekly drops, zero spam. Unsubscribe anytime.
                </div>
                <div className="nl-input-row">
                  <input
                    className="nl-input"
                    type="email"
                    placeholder="your@email.com"
                  />
                  <button className="nl-btn" type="button">
                    Subscribe
                  </button>
                </div>
                <div className="nl-fine">
                  By subscribing, you agree to our privacy policy.
                </div>
                <div className="nl-stats">
                  {[
                    ["2k+", "Customers"],
                    ["300+", "Products"],
                    ["4.7★", "Avg rating"],
                  ].map(([n, l]) => (
                    <div key={l} className="nl-stat">
                      <div className="nl-stat-num">{n}</div>
                      <div className="nl-stat-label">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── CSS ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Lora:wght@400;600;700&display=swap');

:root {
  --navy: #123B5D;
  --navy-dark: #092A44;
  --navy-mid: #286487;
  --green: #73C653;
  --green-dark: #4E9F39;
  --green-light: #ECF8E8;
  --navy-light: #EAF2F7;
  --navy-xlight: #F4F8FB;
  --text-main: #102638;
  --text-mid: #496477;
  --text-muted: #7890A0;
  --border: #DCE7ED;
  --white: #ffffff;
  --off-white: #F7FAFB;
  --surface-shadow: 0 16px 45px rgba(18,59,93,.09);
  --surface-shadow-hover: 0 24px 60px rgba(18,59,93,.16);
}

.home-root {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: var(--text-main);
  background:
    radial-gradient(circle at 4% 5%, rgba(115,198,83,.09), transparent 28rem),
    radial-gradient(circle at 96% 24%, rgba(40,100,135,.08), transparent 30rem),
    #fbfdfd;
  overflow: hidden;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.home-root a,
.home-root button,
.home-root input {
  transition-duration: .25s;
  transition-timing-function: cubic-bezier(.2,.8,.2,1);
}
.home-root a:focus-visible,
.home-root button:focus-visible,
.home-root input:focus-visible {
  outline: 3px solid rgba(115,198,83,.32);
  outline-offset: 3px;
}

.home-alert-error,
.home-alert-empty {
  border: 1.5px solid var(--border);
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  font-size: 14px;
  color: var(--text-mid);
}

.cat-skeleton {
  pointer-events: none;
}

.skeleton-box,
.skeleton-line {
  position: relative;
  overflow: hidden;
  background: #e9eef5;
}

.skeleton-box::after,
.skeleton-line::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,0.8),
    transparent
  );
  animation: shimmer 1.4s infinite;
}

.skeleton-line {
  height: 10px;
  border-radius: 999px;
  margin-inline: auto;
  margin-top: 8px;
}

.skeleton-line-lg {
  width: 70%;
}

.skeleton-line-sm {
  width: 45%;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* ── TRUST BAR ── */
.trust-bar {
  background: linear-gradient(100deg, #0a2d49, #164f71 52%, #0d3855);
  padding: 12px 0;
  border-bottom: 1px solid rgba(115,198,83,.5);
  box-shadow: inset 0 -1px 0 rgba(255,255,255,.06);
}
.trust-bar-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 36px;
  flex-wrap: wrap;
}
.trust-bar-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,.92);
  letter-spacing: .015em;
}
.trust-bar-icon {
  color: var(--green);
  font-size: 13px;
}

/* ── HERO ── */
.hero {
  position: relative;
  padding: 88px 0 76px;
  overflow: hidden;
  transition: background 0.7s ease;
  isolation: isolate;
  border-bottom: 1px solid rgba(18,59,93,.08);
}
.hero::after {
  content: "";
  position: absolute;
  width: 420px;
  height: 420px;
  right: 4%;
  top: 4%;
  border: 1px solid rgba(18,59,93,.08);
  border-radius: 50%;
  box-shadow: 0 0 0 70px rgba(115,198,83,.035), 0 0 0 140px rgba(18,59,93,.025);
  z-index: -1;
}
.hero-geo {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.hero-geo-1 {
  width: 600px; height: 600px;
  right: -120px; top: -160px;
}
.hero-geo-2 {
  width: 400px; height: 400px;
  left: -80px; bottom: -100px;
}
.hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) 440px;
  gap: 72px;
  align-items: center;
  position: relative;
  z-index: 1;
}
.hero-fade-in { animation: heroIn .4s ease both; }
.hero-fade-out { opacity: 0; transform: translateY(6px); }
@keyframes heroIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .085em;
  text-transform: uppercase;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid;
  margin-bottom: 22px;
  box-shadow: 0 8px 24px rgba(18,59,93,.05);
}
.hero-h1 {
  font-family: 'Lora', serif;
  font-size: clamp(46px, 5.2vw, 68px);
  font-weight: 700;
  line-height: 1.06;
  letter-spacing: -.035em;
  margin: 0 0 20px;
  color: var(--navy);
}
.hero-h1-accent {
  color: var(--green-dark);
}
.hero-sub {
  font-size: 16.5px;
  color: var(--text-mid);
  line-height: 1.75;
  margin: 0 0 22px;
  font-weight: 500;
  max-width: 540px;
}
.hero-offer {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid;
  margin-bottom: 28px;
}
.hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }

.btn-primary-brand {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 14px 28px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--navy), #1c5679);
  color: #fff;
  font-weight: 700;
  font-size: 14.5px;
  text-decoration: none;
  transition: background .2s, transform .15s, box-shadow .2s;
  box-shadow: 0 10px 24px rgba(18,59,93,.22);
  letter-spacing: -0.01em;
}
.btn-primary-brand:hover {
  background: linear-gradient(135deg, var(--navy-dark), var(--navy));
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(18,59,93,.3);
  color: #fff;
}
.btn-ghost-brand {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14.5px;
  text-decoration: none;
  border: 1.5px solid var(--navy);
  color: var(--navy);
  background: rgba(255,255,255,.42);
  backdrop-filter: blur(8px);
  transition: background .2s, transform .15s, box-shadow .2s;
}
.btn-ghost-brand:hover {
  background: rgba(255,255,255,.8);
  transform: translateY(-2px);
  color: var(--navy);
  box-shadow: 0 12px 28px rgba(18,59,93,.1);
}

.hero-micro-trust {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.hero-micro {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-mid);
  display: flex;
  align-items: center;
  gap: 5px;
}
.hero-micro i { color: var(--green-dark); }

.hero-visual {
  position: relative;
}
.hero-card {
  background: rgba(255,255,255,.94);
  border-radius: 28px;
  border: 1px solid rgba(255,255,255,.92);
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(18,59,93,.2);
  backdrop-filter: blur(18px);
}
.hero-card-img {
  position: relative;
  height: 230px;
  background:
    radial-gradient(circle at 50% 35%, rgba(255,255,255,.95), rgba(255,255,255,.25) 48%, transparent 70%),
    linear-gradient(145deg, #eef7eb, #e8f1f6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
}
.hero-card-product-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  filter: drop-shadow(0 14px 18px rgba(18,59,93,.12));
  transition: transform .35s ease;
}
.hero-card:hover .hero-card-product-img { transform: scale(1.025); }
.hero-card-img-bg {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .7s;
}
.hero-card-icon { font-size: 60px; }
.hero-card-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10.5px;
  font-weight: 700;
  color: #fff;
  padding: 6px 11px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  letter-spacing: 0.03em;
  box-shadow: 0 6px 18px rgba(18,59,93,.12);
}
.hero-card-body { padding: 20px 22px 22px; }
.hero-card-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}
.hero-card-name { font-weight: 800; font-size: 16px; line-height: 1.4; margin-bottom: 7px; color: var(--text-main); }
.hero-card-rating { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.hero-card-price-row { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.hero-card-price { font-size: 19px; font-weight: 800; color: var(--navy); }
.hero-card-old { font-size: 12.5px; color: var(--text-muted); text-decoration: line-through; }
.hero-card-off {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
}
.hero-card-btn {
  width: 100%;
  padding: 12px;
  border-radius: 11px;
  background: linear-gradient(135deg, var(--navy), #1c5679);
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background .2s, transform .2s, box-shadow .2s;
}
.hero-card-btn:hover {
  background: linear-gradient(135deg, var(--navy-dark), var(--navy));
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(18,59,93,.22);
}

.hero-stat-cards {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
.hero-stat-card {
  flex: 1;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 13px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 28px rgba(18,59,93,.09);
  animation: floatBob 3s ease-in-out infinite;
}
.hero-stat-card-2 { animation-delay: .5s; }
@keyframes floatBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
.hero-stat-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.hero-stat-val { font-size: 13px; font-weight: 800; color: var(--text-main); }
.hero-stat-label { font-size: 11px; color: var(--text-muted); }

.hero-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 40px;
  position: relative;
  z-index: 1;
}
.hero-dot {
  width: 8px; height: 8px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: all .3s;
  padding: 0;
  background: var(--border);
}
.hero-dot.active {
  width: 28px;
  background: var(--navy);
}

.section { padding: 92px 0; position: relative; }
.section-alt {
  background:
    radial-gradient(circle at 0 50%, rgba(115,198,83,.08), transparent 30rem),
    radial-gradient(circle at 100% 50%, rgba(40,100,135,.07), transparent 30rem),
    linear-gradient(180deg, #f4f8fa 0%, #eef5f7 100%);
  border-block: 1px solid rgba(18,59,93,.06);
}
.sec-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 38px;
  gap: 16px;
}
.sec-title {
  font-family: 'Lora', serif;
  font-size: clamp(29px, 3vw, 39px);
  font-weight: 700;
  margin: 0 0 7px;
  letter-spacing: -.035em;
  color: var(--navy);
}
.sec-sub { font-size: 14px; line-height: 1.65; color: var(--text-mid); margin: 0; }
.sec-link {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--navy);
  text-decoration: none;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid rgba(18,59,93,.22);
  padding: 9px 16px;
  border-radius: 10px;
  background: rgba(255,255,255,.65);
  transition: background .2s, color .2s, transform .2s, box-shadow .2s;
}
.sec-link:hover {
  background: var(--navy);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(18,59,93,.18);
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 18px;
}
.cat-card {
  background: linear-gradient(145deg, #fff 30%, var(--cat-bg));
  border-radius: 22px;
  padding: 26px 14px 24px;
  text-align: center;
  cursor: pointer;
  transition: transform .25s, box-shadow .25s, border-color .25s;
  border: 1px solid rgba(18,59,93,.08);
  min-height: 158px;
  box-shadow: var(--surface-shadow);
}
.cat-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--surface-shadow-hover);
  border-color: var(--cat-color);
}
.cat-icon-wrap {
  width: 60px; height: 60px;
  border-radius: 19px;
  background: rgba(255,255,255,.9);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 11px;
  box-shadow: 0 8px 22px rgba(18,59,93,.09);
  transition: transform .25s, box-shadow .25s;
}
.cat-card:hover .cat-icon-wrap { transform: scale(1.06); box-shadow: 0 12px 28px rgba(18,59,93,.13); }
.cat-icon { font-size: 24px; color: var(--cat-color); }
.cat-title { font-size: 13.5px; font-weight: 800; line-height: 1.35; color: var(--text-main); margin-bottom: 5px; }
.cat-count { font-size: 10.5px; font-weight: 500; color: var(--text-muted); }

.scroll-row-wrap { position: relative; }
.scroll-row {
  display: flex;
  gap: 22px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding: 10px 4px 28px;
}
.scroll-row::-webkit-scrollbar { display: none; }
.scroll-btn {
  position: absolute;
  top: 50%; transform: translateY(-60%);
  width: 42px; height: 42px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--white);
  box-shadow: 0 10px 26px rgba(18,59,93,.14);
  cursor: pointer;
  z-index: 3;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--navy);
  transition: box-shadow .2s, background .2s;
}
@media (min-width: 768px) { .scroll-btn { display: flex; } }
.scroll-btn:hover { background: var(--navy); color: #fff; box-shadow: 0 6px 20px rgba(27,61,110,.2); }
.scroll-btn-left { left: -18px; }
.scroll-btn-right { right: -18px; }

.product-card {
  background: var(--white);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(18,59,93,.09);
  transition: transform .25s, box-shadow .25s, border-color .25s;
  scroll-snap-align: start;
  flex-shrink: 0;
  width: 236px;
  height: 460px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--surface-shadow);
}
.product-card-link {
  display: flex;
  width: 236px;
  height: 460px;
  flex-shrink: 0;
}
.best-sellers-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 16px;
}
.product-card-link-compact {
  width: 100%;
  height: 360px;
  min-width: 0;
}
.product-card-compact {
  width: 100%;
  height: 360px;
  min-width: 0;
  border-radius: 18px;
}
.product-card-compact .product-img-wrap {
  height: 145px;
  padding: 12px;
}
.product-card-compact .discount-badge {
  top: 8px;
  left: 8px;
  padding: 4px 7px;
  font-size: 8.5px;
}
.product-card-compact .product-body {
  padding: 13px 11px 14px;
}
.product-card-compact .product-brand {
  font-size: 8.5px;
  margin-bottom: 3px;
}
.product-card-compact .product-name {
  height: 49px;
  font-size: 11.5px;
  line-height: 1.4;
  margin-bottom: 5px;
}
.product-card-compact .product-meta {
  gap: 3px;
  margin-bottom: 5px;
}
.product-card-compact .product-meta > span:first-child {
  font-size: 9px !important;
  white-space: nowrap;
}
.product-card-compact .review-count {
  font-size: 9px;
}
.product-card-compact .product-price-row {
  min-height: 36px;
  gap: 2px 5px;
  margin-bottom: 8px;
}
.product-card-compact .product-price {
  font-size: 13.5px;
}
.product-card-compact .product-old {
  font-size: 9px;
}
.product-card-compact .add-btn {
  padding: 8px 5px;
  border-radius: 9px;
  font-size: 10.5px;
}
.product-card:hover {
  transform: translateY(-7px);
  box-shadow: var(--surface-shadow-hover);
  border-color: #C4D8EE;
}
.product-img-wrap {
  position: relative;
  height: 205px;
  padding: 18px;
  background:
    radial-gradient(circle at 50% 42%, rgba(255,255,255,.95), transparent 58%),
    linear-gradient(145deg, #f0f8ed, #eaf2f6);
  overflow: hidden;
}
.product-img-wrap img {
  filter: drop-shadow(0 12px 16px rgba(18,59,93,.09));
  transition: transform .4s cubic-bezier(.2,.8,.2,1);
}
.product-card:hover .product-img-wrap img { transform: scale(1.045); }
.product-img-ph {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, var(--navy-light), var(--green-light));
}
.discount-badge {
  position: absolute;
  top: 10px; left: 10px;
  background: linear-gradient(135deg, #E34855, #C92E3E);
  color: #fff;
  font-size: 10.5px;
  font-weight: 800;
  padding: 5px 10px;
  border-radius: 999px;
  z-index: 2;
  letter-spacing: 0.02em;
  box-shadow: 0 6px 16px rgba(201,46,62,.2);
}
.product-body {
  padding: 20px 18px 20px;
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}
.product-brand { font-size: 10px; color: var(--navy-mid); font-weight: 800; text-transform: uppercase; letter-spacing: .09em; margin-bottom: 5px; }
.product-name {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.45;
  height: 63px;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
.product-meta { display: flex; align-items: center; gap: 5px; margin-bottom: 8px; }
.review-count { font-size: 11px; color: var(--text-muted); }
.product-price-row {
  display: flex;
  align-items: center;
  align-content: flex-start;
  gap: 4px 8px;
  min-height: 43px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.product-price { font-size: 18px; font-weight: 800; letter-spacing: -.02em; color: var(--navy); }
.product-old { font-size: 12px; color: var(--text-muted); text-decoration: line-through; }
.add-btn {
  width: 100%;
  padding: 11px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--navy), #1c5679);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background .2s, transform .2s, box-shadow .2s;
  letter-spacing: -0.01em;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  margin-top: auto;
}
.add-btn:hover {
  background: linear-gradient(135deg, var(--navy-dark), var(--navy));
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(18,59,93,.2);
}
.add-btn.added { background: var(--green-dark); }
.add-btn.cart-error { background: #b8323e; }
.add-btn:disabled {
  cursor: not-allowed;
  opacity: .62;
  transform: none;
  box-shadow: none;
}
.add-btn:disabled:hover {
  transform: none;
  box-shadow: none;
}
.cart-spin { animation: cartSpin .8s linear infinite; }
@keyframes cartSpin {
  to { transform: rotate(360deg); }
}
.add-btn:active { transform: scale(.97); }

.bundles-section {
  background:
    radial-gradient(circle at 90% 10%, rgba(107,191,78,.16), transparent 26rem),
    linear-gradient(135deg, #edf3fb 0%, #e8f3e5 100%);
}
.bundle-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.bundle-card {
  border-radius: 24px;
  padding: 28px;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid rgba(27,61,110,.09);
  box-shadow: 0 14px 34px rgba(27,61,110,.07);
}
.bundle-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 44px rgba(27,61,110,.13);
}
.bundle-top { display: flex; align-items: center; justify-content: space-between; }
.bundle-icon-wrap {
  width: 46px; height: 46px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
}
.bundle-save {
  font-size: 12px;
  font-weight: 800;
  padding: 5px 13px;
  border-radius: 999px;
  letter-spacing: 0.02em;
}
.bundle-title {
  font-family: 'Lora', serif;
  font-size: 17.5px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-main);
}
.bundle-desc { font-size: 13px; color: var(--text-mid); line-height: 1.5; flex: 1; }
.bundle-items-note { font-size: 12px; font-weight: 700; display: flex; align-items: center; }
.bundle-price-row { display: flex; align-items: center; gap: 10px; }
.bundle-price { font-size: 19px; font-weight: 800; color: var(--navy); }
.bundle-old { font-size: 13px; color: var(--text-muted); text-decoration: line-through; }
.bundle-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 20px;
  border-radius: 9px;
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  margin-top: 4px;
  transition: opacity .2s, transform .15s;
}
.bundle-cta:hover { opacity: .88; transform: translateY(-1px); }

.concern-section { background: var(--white); }
.concern-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.concern-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--off-white);
  border: 1.5px solid var(--border);
  border-radius: 18px;
  padding: 22px 24px;
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s, transform .2s;
}
.concern-card:hover {
  border-color: var(--navy);
  box-shadow: 0 6px 20px rgba(27,61,110,.1);
  transform: translateX(4px);
}
.concern-icon-wrap {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: var(--navy-light);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.concern-icon { font-size: 20px; color: var(--navy); }
.concern-title { font-size: 14px; font-weight: 700; color: var(--text-main); }
.concern-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.concern-arrow { margin-left: auto; color: var(--text-muted); font-size: 13px; }

.trust-section {
  background:
    radial-gradient(circle at 12% 10%, rgba(115,198,83,.14), transparent 24rem),
    radial-gradient(circle at 88% 88%, rgba(82,154,188,.18), transparent 28rem),
    linear-gradient(135deg, #092b46 0%, #123f60 55%, #0b324e 100%);
  color: #fff;
}
.trust-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 82px;
  align-items: center;
  padding: 60px 0;
}
.trust-eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--green);
  margin-bottom: 14px;
}
.trust-eyebrow-line {
  display: block;
  width: 28px;
  height: 2px;
  background: var(--green);
  flex-shrink: 0;
}
.trust-title {
  font-family: 'Lora', serif;
  font-size: clamp(28px, 3.5vw, 42px);
  font-weight: 700;
  line-height: 1.15;
  margin: 0 0 16px;
  letter-spacing: -.035em;
}
.trust-body {
  font-size: 15.5px;
  color: rgba(255,255,255,.68);
  line-height: 1.7;
  margin: 0 0 36px;
  font-weight: 400;
}
.trust-feats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.trust-feat {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px;
  margin: -14px;
  border-radius: 16px;
  transition: background .25s, transform .25s;
}
.trust-feat:hover { background: rgba(255,255,255,.055); transform: translateY(-2px); }
.trust-feat-icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  background: rgba(115,198,83,.16);
  border: 1px solid rgba(115,198,83,.18);
  display: flex; align-items: center; justify-content: center;
  font-size: 17px;
  color: var(--green);
  flex-shrink: 0;
}
.trust-feat-title { font-size: 13.5px; font-weight: 700; margin-bottom: 2px; }
.trust-feat-sub { font-size: 12px; color: rgba(255,255,255,.5); }

.newsletter-card {
  background: linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.055));
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 30px;
  padding: 44px;
  backdrop-filter: blur(14px);
  box-shadow: 0 30px 70px rgba(0,18,31,.22), inset 0 1px 0 rgba(255,255,255,.08);
}
.nl-icon-row { margin-bottom: 20px; }
.nl-brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 800;
  color: var(--green);
  background: rgba(107,191,78,.12);
  border: 1px solid rgba(107,191,78,.3);
  padding: 6px 14px;
  border-radius: 999px;
}
.nl-brand-mark i { font-size: 14px; }
.nl-tag {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--green);
  margin-bottom: 10px;
}
.nl-title { font-family: 'Lora', serif; font-size: 22px; font-weight: 700; margin-bottom: 6px; }
.nl-sub { font-size: 14px; color: rgba(255,255,255,.55); margin-bottom: 24px; }
.nl-input-row { display: flex; gap: 8px; margin-bottom: 10px; }
.nl-input {
  flex: 1;
  padding: 12px 18px;
  border-radius: 11px;
  border: 1.5px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.1);
  color: #fff;
  font-size: 14px;
  outline: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: border-color .2s;
}
.nl-input:focus { border-color: var(--green); background: rgba(255,255,255,.14); }
.nl-input::placeholder { color: rgba(255,255,255,.35); }
.nl-btn {
  padding: 12px 22px;
  border-radius: 11px;
  background: linear-gradient(135deg, #83D663, var(--green));
  color: var(--navy);
  font-weight: 800;
  font-size: 14px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background .2s, transform .2s, box-shadow .2s;
}
.nl-btn:hover {
  background: linear-gradient(135deg, #91DE73, #78CA59);
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(115,198,83,.18);
}
.nl-fine { font-size: 11px; color: rgba(255,255,255,.35); margin-bottom: 28px; }
.nl-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  border-top: 1px solid rgba(255,255,255,.1);
  padding-top: 24px;
}
.nl-stat { text-align: center; }
.nl-stat-num {
  font-family: 'Lora', serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--green);
}
.nl-stat-label { font-size: 12px; color: rgba(255,255,255,.5); margin-top: 2px; }

@media (max-width: 1200px) {
  .hero-inner { grid-template-columns: 1fr 360px; gap: 40px; }
  .best-sellers-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
}
@media (max-width: 1024px) {
  .cat-grid { grid-template-columns: repeat(4, 1fr); }
  .best-sellers-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .bundle-grid { grid-template-columns: repeat(2, 1fr); }
  .concern-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .hero-inner { grid-template-columns: 1fr; gap: 32px; }
  .hero-visual { display: none; }
  .hero { padding: 48px 0 42px; }
  .section { padding: 64px 0; }
  .cat-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .best-sellers-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .cat-card { min-height: 138px; }
  .product-card { width: 210px; height: 435px; }
  .product-card-link { width: 210px; height: 435px; }
  .product-img-wrap { height: 180px; }
  .bundle-grid { grid-template-columns: 1fr; }
  .concern-grid { grid-template-columns: 1fr; }
  .trust-grid { grid-template-columns: 1fr; gap: 40px; padding: 40px 0; }
  .trust-feats { grid-template-columns: 1fr; }
  .sec-head { flex-direction: column; align-items: flex-start; gap: 10px; }
  .trust-bar-inner { gap: 16px; }
  .newsletter-card { padding: 32px; }
}
@media (max-width: 480px) {
  .cat-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .best-sellers-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .cat-card { padding: 18px 8px; min-height: 128px; }
  .cat-icon-wrap { width: 46px; height: 46px; }
  .cat-icon { font-size: 18px; }
  .cat-title { font-size: 11px; }
  .hero-h1 { font-size: 39px; }
  .hero-sub { font-size: 15px; }
  .hero-ctas { gap: 10px; }
  .btn-primary-brand,
  .btn-ghost-brand { width: 100%; justify-content: center; }
  .newsletter-card { padding: 26px 20px; border-radius: 24px; }
  .nl-input-row { flex-direction: column; }
  .nl-input,
  .nl-btn { width: 100%; }
  .nl-stats { gap: 8px; }
  .trust-grid { padding: 28px 0; }
}
@media (prefers-reduced-motion: reduce) {
  .home-root *,
  .home-root *::before,
  .home-root *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
`;
