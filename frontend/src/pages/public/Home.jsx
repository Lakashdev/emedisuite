import { Link } from "react-router-dom";
import { useRef, useState, useEffect, useMemo } from "react";

/* ─── API BASE ─── */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/* ─── BRAND TOKENS ─── */
// Navy: #1B3D6E   Green: #6BBF4E   Light green: #E8F5E2   Light navy: #EEF2F8

/* ─── DATA ─── */

async function fetchHeroSlides() {
  const res = await fetch(`${API_BASE}/hero-slides`);
  if (!res.ok) throw new Error("Failed to fetch hero slides");
  return res.json();
}

/* keep product demo sections for now */
const trending = [
  { id: 1, name: "SPF 50+ Daily Sunscreen", brand: "Minimalist", price: 1199, oldPrice: 1499, off: 20, tag: "Best seller", rating: 4.8, reviews: 2341 },
  { id: 2, name: "Ceramide Barrier Cream", brand: "CeraVe", price: 1899, oldPrice: 2299, off: 17, tag: "Skin barrier", rating: 4.9, reviews: 1820 },
  { id: 3, name: "Niacinamide 10% Serum", brand: "The Ordinary", price: 1399, oldPrice: 1699, off: 18, tag: "Oil control", rating: 4.7, reviews: 3102 },
  { id: 4, name: "Hyaluronic Acid Serum", brand: "Neutrogena", price: 1599, oldPrice: 1999, off: 20, tag: "Hydration", rating: 4.6, reviews: 987 },
  { id: 5, name: "Vitamin C Brightening", brand: "Mamaearth", price: 849, oldPrice: 999, off: 15, tag: "Glow booster", rating: 4.5, reviews: 1456 },
  { id: 6, name: "Retinol Night Cream", brand: "Olay", price: 1299, oldPrice: 1599, off: 19, tag: "Anti-aging", rating: 4.7, reviews: 762 },
];

const bestSellers = [
  { id: 7, name: "Gentle Foaming Cleanser", brand: "La Roche-Posay", price: 999, oldPrice: 1199, off: 17, tag: "Daily wash", rating: 4.8, reviews: 4201 },
  { id: 8, name: "Multivitamin Gummies", brand: "Vitafusion", price: 799, oldPrice: 999, off: 20, tag: "Daily health", rating: 4.6, reviews: 2890 },
  { id: 9, name: "Calamine Soothing Lotion", brand: "Lacto-Calamine", price: 199, oldPrice: 249, off: 20, tag: "Soothing", rating: 4.5, reviews: 5670 },
  { id: 10, name: "Micellar Cleansing Water", brand: "Bioderma", price: 699, oldPrice: 849, off: 18, tag: "Makeup remover", rating: 4.9, reviews: 3344 },
  { id: 11, name: "After Sun Gel", brand: "Banana Boat", price: 449, oldPrice: 549, off: 18, tag: "Sun relief", rating: 4.4, reviews: 891 },
  { id: 12, name: "Hand Cream Intensive", brand: "Neutrogena", price: 349, oldPrice: 449, off: 22, tag: "Repair", rating: 4.7, reviews: 2100 },
];

const newArrivals = [
  { id: 13, name: "Peptide Lifting Serum", brand: "COSRX", price: 2199, oldPrice: 2599, off: 15, tag: "New", rating: 4.8, reviews: 120 },
  { id: 14, name: "Bakuchiol Retinol Alt.", brand: "Youth to the People", price: 3299, oldPrice: 3799, off: 13, tag: "New", rating: 4.6, reviews: 87 },
  { id: 15, name: "Probiotic Toner", brand: "Good Molecules", price: 1099, oldPrice: 1299, off: 15, tag: "New", rating: 4.7, reviews: 203 },
  { id: 16, name: "Blue Light Defense SPF", brand: "Supergoop!", price: 2499, oldPrice: 2899, off: 14, tag: "New", rating: 4.9, reviews: 65 },
  { id: 17, name: "Scalp Serum Treatment", brand: "The INKEY List", price: 1799, oldPrice: 2099, off: 14, tag: "New", rating: 4.5, reviews: 178 },
  { id: 18, name: "Collagen Booster Drops", brand: "Klairs", price: 1999, oldPrice: 2399, off: 17, tag: "New", rating: 4.8, reviews: 92 },
];

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

const healthConcerns = [
  { title: "Full Body Check", icon: "bi-activity", href: "/labs?concern=full-body", sub: "Comprehensive" },
  { title: "Diabetes Care", icon: "bi-droplet-half", href: "/labs?concern=diabetes", sub: "Monitor & manage" },
  { title: "Women's Health", icon: "bi-heart", href: "/products?category=women-care", sub: "Hormonal balance" },
  { title: "Thyroid Panel", icon: "bi-clipboard2-pulse", href: "/labs?concern=thyroid", sub: "T3, T4, TSH" },
  { title: "Bone & Joint", icon: "bi-universal-access", href: "/products?category=supplements", sub: "Vitamin D, Calcium" },
  { title: "Gut Health", icon: "bi-heart-pulse", href: "/products?category=wellness", sub: "Probiotics & more" },
];

/* ─── API HELPERS ─── */
async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }
  return res.json();
}

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
function ProductCard({ p, onAddCart }) {
  const [added, setAdded] = useState(false);

  function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);
    onAddCart?.();
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <Link
      to={`/products/${p.id}`}
      className="text-decoration-none"
      style={{ display: "block", width: 210, flexShrink: 0 }}
    >
      <div className="product-card">
        <div className="product-img-wrap">
          {p.off ? <span className="discount-badge">{p.off}% OFF</span> : null}
          <button
            className="wish-btn"
            type="button"
            aria-label="wishlist"
            onClick={(e) => e.preventDefault()}
          >
            <i className="bi bi-heart" />
          </button>
          <div className="product-img-ph" />
        </div>
        <div className="product-body">
          <div className="product-brand">{p.brand}</div>
          <div className="product-name">{p.name}</div>
          <div className="product-meta">
            <Stars rating={p.rating} />
            <span className="review-count">({p.reviews.toLocaleString()})</span>
          </div>
          <div className="product-price-row">
            <span className="product-price">NPR {p.price.toLocaleString()}</span>
            <span className="product-old">NPR {p.oldPrice.toLocaleString()}</span>
          </div>
          <button className={`add-btn ${added ? "added" : ""}`} onClick={handleAdd} type="button">
            {added ? (
              <>
                <i className="bi bi-check2" /> Added
              </>
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
                  src={s.product.images[0].url}
                  alt={s.featName}
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
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
      });
  }, [categories]);

  return (
    <div className="home-root">
      <style>{CSS}</style>

      <TrustBar />
      <Hero />

      {/* CATEGORIES */}
      <section className="section container">
        <SecHead title="Shop by category" sub="Find what your skin, body & family needs." href="/products" />

        {catLoading ? (
          <div className="cat-grid">
            {Array.from({ length: 8 }).map((_, i) => (
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
                <div className="cat-card" style={{ "--cat-color": c.color, "--cat-bg": c.bg }}>
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

      {/* TRENDING */}
      <section className="section section-alt">
        <div className="container">
          <SecHead title="Trending now" sub="What everyone's adding to cart this week." href="/products" />
          <ScrollRow items={trending} renderItem={(p) => <ProductCard key={p.id} p={p} />} />
        </div>
      </section>

      {/* BUNDLES */}
      <section className="section bundles-section">
        <div className="container">
          <SecHead title="Curated bundles" sub="Better together — save more with expert-curated kits." href="/products" action="See all bundles" />
          <div className="bundle-grid">
            {bundles.map((b) => (
              <Link key={b.id} to="/products" className="text-decoration-none">
                <div className="bundle-card" style={{ background: b.bg }}>
                  <div className="bundle-top">
                    <div className="bundle-icon-wrap" style={{ background: `${b.color}18`, color: b.color }}>
                      <i className={`bi ${b.icon}`} />
                    </div>
                    <span className="bundle-save" style={{ color: b.color, background: `${b.color}15`, border: `1px solid ${b.color}25` }}>
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
                    <span className="bundle-price">NPR {b.price.toLocaleString()}</span>
                    <span className="bundle-old">NPR {b.oldPrice.toLocaleString()}</span>
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

      {/* BEST SELLERS */}
      <section className="section container">
        <SecHead title="Best sellers" sub="Tried, trusted, and loved by thousands." href="/products" />
        <ScrollRow items={bestSellers} renderItem={(p) => <ProductCard key={p.id} p={p} />} />
      </section>

      {/* HEALTH CONCERNS */}
      <section className="section concern-section">
        <div className="container">
          <SecHead title="Shop by health concern" sub="Find the right products for your specific needs." href="/products" />
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

      {/* NEW ARRIVALS */}
      <section className="section section-alt">
        <div className="container">
          <SecHead title="New arrivals" sub="Fresh formulas and innovations just landed." href="/products" />
          <ScrollRow items={newArrivals} renderItem={(p) => <ProductCard key={p.id} p={p} />} />
        </div>
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
                Every product is verified, every brand is trusted. We bring you clean, effective wellness without compromise — delivered right to your door.
              </p>
              <div className="trust-feats">
                {[
                  { icon: "bi-shield-fill-check", title: "Genuine products", sub: "Verified directly from brands" },
                  { icon: "bi-truck", title: "Fast COD delivery", sub: "Ring road & beyond" },
                  { icon: "bi-arrow-counterclockwise", title: "Easy returns", sub: "Hassle-free policy" },
                  { icon: "bi-headset", title: "Expert support", sub: "Chat or call anytime" },
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
                <div className="nl-title">Offers, routines &amp; wellness tips</div>
                <div className="nl-sub">Weekly drops, zero spam. Unsubscribe anytime.</div>
                <div className="nl-input-row">
                  <input className="nl-input" type="email" placeholder="your@email.com" />
                  <button className="nl-btn" type="button">Subscribe</button>
                </div>
                <div className="nl-fine">By subscribing, you agree to our privacy policy.</div>
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
}

.home-root {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: var(--text-main);
  background: var(--off-white);
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
  background: var(--navy);
  padding: 10px 0;
  border-bottom: 2px solid var(--green);
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
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  letter-spacing: 0.01em;
}
.trust-bar-icon {
  color: var(--green);
  font-size: 13px;
}

/* ── HERO ── */
.hero {
  position: relative;
  padding: 60px 0 52px;
  overflow: hidden;
  transition: background 0.7s ease;
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
  grid-template-columns: 1fr 420px;
  gap: 56px;
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
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid;
  margin-bottom: 20px;
}
.hero-h1 {
  font-family: 'Lora', serif;
  font-size: clamp(38px, 5vw, 60px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.025em;
  margin: 0 0 18px;
  color: var(--navy);
}
.hero-h1-accent {
  color: var(--green-dark);
}
.hero-sub {
  font-size: 16.5px;
  color: var(--text-mid);
  line-height: 1.65;
  margin: 0 0 20px;
  font-weight: 400;
  max-width: 440px;
}
.hero-offer {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: 999px;
  border: 1px solid;
  margin-bottom: 28px;
}
.hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }

.btn-primary-brand {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 13px 28px;
  border-radius: 10px;
  background: var(--navy);
  color: #fff;
  font-weight: 700;
  font-size: 14.5px;
  text-decoration: none;
  transition: background .2s, transform .15s, box-shadow .2s;
  box-shadow: 0 4px 16px rgba(27,61,110,.25);
  letter-spacing: -0.01em;
}
.btn-primary-brand:hover {
  background: var(--navy-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(27,61,110,.32);
  color: #fff;
}
.btn-ghost-brand {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 13px 28px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14.5px;
  text-decoration: none;
  border: 1.5px solid var(--navy);
  color: var(--navy);
  background: transparent;
  transition: background .2s, transform .15s;
}
.btn-ghost-brand:hover {
  background: var(--navy-light);
  transform: translateY(-2px);
  color: var(--navy);
}

.hero-micro-trust {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.hero-micro {
  font-size: 12px;
  font-weight: 600;
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
  background: var(--white);
  border-radius: 20px;
  border: 1.5px solid var(--border);
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(27,61,110,.12);
}
.hero-card-img {
  position: relative;
  height: 190px;
}
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
  padding: 4px 10px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  letter-spacing: 0.03em;
}
.hero-card-body { padding: 18px 20px 20px; }
.hero-card-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}
.hero-card-name { font-weight: 700; font-size: 16px; margin-bottom: 6px; color: var(--text-main); }
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
  padding: 10px;
  border-radius: 8px;
  background: var(--navy);
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background .2s;
}
.hero-card-btn:hover { background: var(--navy-dark); }

.hero-stat-cards {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
.hero-stat-card {
  flex: 1;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(27,61,110,.07);
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

.section { padding: 60px 0; }
.section-alt { background: var(--navy-xlight); }
.sec-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  gap: 16px;
}
.sec-title {
  font-family: 'Lora', serif;
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 700;
  margin: 0 0 4px;
  letter-spacing: -0.025em;
  color: var(--navy);
}
.sec-sub { font-size: 14px; color: var(--text-muted); margin: 0; }
.sec-link {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--navy);
  text-decoration: none;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1.5px solid var(--navy);
  padding: 7px 16px;
  border-radius: 8px;
  transition: background .2s, color .2s;
}
.sec-link:hover { background: var(--navy); color: #fff; }

.cat-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
}
.cat-card {
  background: var(--cat-bg);
  border-radius: 16px;
  padding: 22px 10px 18px;
  text-align: center;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s, border-color .2s;
  border: 1.5px solid transparent;
}
.cat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 28px rgba(27,61,110,.1);
  border-color: var(--cat-color);
}
.cat-icon-wrap {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: rgba(255,255,255,.85);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 11px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}
.cat-icon { font-size: 22px; color: var(--cat-color); }
.cat-title { font-size: 12.5px; font-weight: 700; color: var(--text-main); margin-bottom: 3px; }
.cat-count { font-size: 10.5px; color: var(--text-muted); }

.scroll-row-wrap { position: relative; }
.scroll-row {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding: 4px 2px 16px;
}
.scroll-row::-webkit-scrollbar { display: none; }
.scroll-btn {
  position: absolute;
  top: 50%; transform: translateY(-60%);
  width: 38px; height: 38px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--white);
  box-shadow: 0 4px 14px rgba(27,61,110,.12);
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
  border-radius: 16px;
  overflow: hidden;
  border: 1.5px solid var(--border);
  transition: transform .2s, box-shadow .2s;
  scroll-snap-align: start;
  flex-shrink: 0;
  width: 210px;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 14px 36px rgba(27,61,110,.11);
  border-color: #C4D8EE;
}
.product-img-wrap { position: relative; height: 165px; }
.product-img-ph {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, var(--navy-light), var(--green-light));
}
.discount-badge {
  position: absolute;
  top: 10px; left: 10px;
  background: #E63946;
  color: #fff;
  font-size: 10.5px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 999px;
  z-index: 2;
  letter-spacing: 0.02em;
}
.wish-btn {
  position: absolute;
  top: 10px; right: 10px;
  width: 30px; height: 30px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--white);
  font-size: 13px;
  color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 2;
  transition: color .2s, border-color .2s, background .2s;
}
.wish-btn:hover { color: #E63946; border-color: #E63946; background: #FFF0F1; }
.product-body { padding: 14px 14px 16px; }
.product-brand { font-size: 10.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 3px; }
.product-name { font-size: 13.5px; font-weight: 600; color: var(--text-main); line-height: 1.4; min-height: 38px; margin-bottom: 6px; }
.product-meta { display: flex; align-items: center; gap: 5px; margin-bottom: 8px; }
.review-count { font-size: 11px; color: var(--text-muted); }
.product-price-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.product-price { font-size: 16px; font-weight: 800; color: var(--navy); }
.product-old { font-size: 12px; color: var(--text-muted); text-decoration: line-through; }
.add-btn {
  width: 100%;
  padding: 9px;
  border-radius: 8px;
  background: var(--navy);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background .2s, transform .1s;
  letter-spacing: -0.01em;
  display: flex; align-items: center; justify-content: center; gap: 5px;
}
.add-btn:hover { background: var(--navy-dark); }
.add-btn.added { background: var(--green-dark); }
.add-btn:active { transform: scale(.97); }

.bundles-section { background: var(--navy-light); }
.bundle-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.bundle-card {
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1.5px solid rgba(27,61,110,.08);
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
  border-radius: 14px;
  padding: 18px 20px;
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

.trust-section { background: var(--navy); color: #fff; }
.trust-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 72px;
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
  letter-spacing: -0.025em;
}
.trust-body {
  font-size: 15.5px;
  color: rgba(255,255,255,.6);
  line-height: 1.7;
  margin: 0 0 36px;
  font-weight: 400;
}
.trust-feats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.trust-feat { display: flex; align-items: flex-start; gap: 14px; }
.trust-feat-icon {
  width: 40px; height: 40px;
  border-radius: 11px;
  background: rgba(107,191,78,.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 17px;
  color: var(--green);
  flex-shrink: 0;
}
.trust-feat-title { font-size: 13.5px; font-weight: 700; margin-bottom: 2px; }
.trust-feat-sub { font-size: 12px; color: rgba(255,255,255,.5); }

.newsletter-card {
  background: rgba(255,255,255,.06);
  border: 1.5px solid rgba(255,255,255,.12);
  border-radius: 24px;
  padding: 36px;
  backdrop-filter: blur(8px);
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
  border-radius: 9px;
  border: 1.5px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.08);
  color: #fff;
  font-size: 14px;
  outline: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: border-color .2s;
}
.nl-input:focus { border-color: var(--green); }
.nl-input::placeholder { color: rgba(255,255,255,.35); }
.nl-btn {
  padding: 12px 22px;
  border-radius: 9px;
  background: var(--green);
  color: var(--navy);
  font-weight: 800;
  font-size: 14px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background .2s, transform .15s;
}
.nl-btn:hover { background: #7DCF60; transform: translateY(-1px); }
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
}
@media (max-width: 1024px) {
  .cat-grid { grid-template-columns: repeat(4, 1fr); }
  .bundle-grid { grid-template-columns: repeat(2, 1fr); }
  .concern-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .hero-inner { grid-template-columns: 1fr; gap: 32px; }
  .hero-visual { display: none; }
  .hero { padding: 40px 0 36px; }
  .cat-grid { grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .bundle-grid { grid-template-columns: 1fr; }
  .concern-grid { grid-template-columns: 1fr; }
  .trust-grid { grid-template-columns: 1fr; gap: 40px; padding: 40px 0; }
  .trust-feats { grid-template-columns: 1fr; }
  .sec-head { flex-direction: column; align-items: flex-start; gap: 10px; }
  .trust-bar-inner { gap: 16px; }
}
@media (max-width: 480px) {
  .cat-grid { grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .cat-card { padding: 14px 6px; }
  .cat-icon-wrap { width: 40px; height: 40px; }
  .cat-icon { font-size: 18px; }
  .cat-title { font-size: 11px; }
  .hero-h1 { font-size: 32px; }
}
`;