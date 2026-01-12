import { Link } from "react-router-dom";
import { useRef } from "react";

const quickActions = [
  { title: "Upload Prescription", icon: "bi-file-earmark-arrow-up", href: "/upload-prescription", note: "Fast order" },
  { title: "Skincare Store", icon: "bi-stars", href: "/products?category=skincare", note: "Trending" },
  { title: "Wellness", icon: "bi-heart-pulse", href: "/products?category=wellness", note: "Daily essentials" },
  { title: "First Aid", icon: "bi-bandaid", href: "/products?category=first-aid", note: "Basics" },
  { title: "Baby Care", icon: "bi-emoji-smile", href: "/products?category=baby-care", note: "Gentle" },
  { title: "Personal Care", icon: "bi-droplet", href: "/products?category=personal-care", note: "Hygiene" },
];

const healthConcerns = [
  { title: "Full Body", icon: "bi-activity", href: "/labs?concern=full-body" },
  { title: "Vitamins", icon: "bi-capsule", href: "/products?category=wellness" },
  { title: "Diabetes", icon: "bi-droplet-half", href: "/labs?concern=diabetes" },
  { title: "Women Care", icon: "bi-heart", href: "/products?category=women-care" },
  { title: "Hair & Skin", icon: "bi-brightness-high", href: "/products?category=skincare" },
  { title: "Thyroid", icon: "bi-clipboard2-pulse", href: "/labs?concern=thyroid" },
  { title: "Bone Health", icon: "bi-universal-access", href: "/products?category=supplements" },
];

const categories = [
  { title: "Sunscreen", href: "/products?q=sunscreen", icon: "bi-sun" },
  { title: "Moisturizer", href: "/products?q=moisturizer", icon: "bi-moisture" },
  { title: "Cleanser", href: "/products?q=cleanser", icon: "bi-bubble" },
  { title: "Serums", href: "/products?q=serum", icon: "bi-droplet" },
  { title: "Vitamins", href: "/products?q=vitamin", icon: "bi-capsule" },
  { title: "Pain Relief", href: "/products?q=pain", icon: "bi-clipboard-plus" },
  { title: "Cold & Flu", href: "/products?q=cold", icon: "bi-thermometer-half" },
  { title: "Baby", href: "/products?category=baby-care", icon: "bi-emoji-smile" },
];

const products1 = [
  { id: 1, name: "SPF 50 Sunscreen", price: 1199, oldPrice: 1499, off: 20, tag: "Best seller" },
  { id: 2, name: "Ceramide Moisturizer", price: 1299, oldPrice: 1599, off: 18, tag: "Barrier repair" },
  { id: 3, name: "Hydrating Cleanser", price: 899, oldPrice: 1099, off: 15, tag: "Gentle" },
  { id: 4, name: "Vitamin C Serum", price: 1599, oldPrice: 1999, off: 20, tag: "Glow" },
  { id: 5, name: "Multivitamin Gummies", price: 799, oldPrice: 999, off: 20, tag: "Wellness" },
  { id: 6, name: "Antiseptic Spray", price: 299, oldPrice: 399, off: 25, tag: "First aid" },
  { id: 7, name: "Lip Balm Repair", price: 249, oldPrice: 299, off: 17, tag: "Repair" },
  { id: 8, name: "Gentle Shampoo", price: 649, oldPrice: 799, off: 19, tag: "Haircare" },
];

const products2 = [
  { id: 9, name: "Niacinamide Serum", price: 1399, oldPrice: 1699, off: 18, tag: "Oil control" },
  { id: 10, name: "Hyaluronic Acid", price: 1499, oldPrice: 1799, off: 16, tag: "Hydration" },
  { id: 11, name: "Face Wash (Daily)", price: 499, oldPrice: 599, off: 17, tag: "Daily" },
  { id: 12, name: "Calamine Lotion", price: 199, oldPrice: 249, off: 20, tag: "Soothing" },
  { id: 13, name: "Hand Sanitizer", price: 149, oldPrice: 199, off: 25, tag: "Hygiene" },
  { id: 14, name: "ORS Sachets", price: 90, oldPrice: 110, off: 18, tag: "Essentials" },
];

const articles = [
  { title: "How to build a simple skincare routine", tag: "Skincare" },
  { title: "Ring road delivery: how fees work", tag: "Delivery" },
  { title: "Medicine safety: storage tips at home", tag: "Pharmacy" },
  { title: "Sunscreen myths: what actually matters", tag: "Skincare" },
];

function SectionHeader({ title, subtitle, actionHref = "/products", actionText = "View all" }) {
  return (
    <div className="d-flex align-items-end justify-content-between mb-3">
      <div>
        <h2 className="h4 fw-bold mb-1 section-title">{title}</h2>
        {subtitle ? <div className="text-secondary">{subtitle}</div> : null}
      </div>
      <Link to={actionHref} className="text-decoration-none" style={{ color: "var(--brand)" }}>
        {actionText} <i className="bi bi-arrow-right" />
      </Link>
    </div>
  );
}

function HorizontalRow({ items, renderItem, leftLabel = "Prev", rightLabel = "Next" }) {
  const ref = useRef(null);

  const scrollBy = (dx) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <div className="position-relative">
      <button
        type="button"
        className="btn btn-light border position-absolute top-50 translate-middle-y d-none d-md-inline"
        style={{ left: -10, zIndex: 2, borderRadius: 999 }}
        onClick={() => scrollBy(-420)}
        aria-label={leftLabel}
      >
        <i className="bi bi-chevron-left" />
      </button>

      <div ref={ref} className="h-scroll">
        {items.map(renderItem)}
      </div>

      <button
        type="button"
        className="btn btn-light border position-absolute top-50 translate-middle-y d-none d-md-inline"
        style={{ right: -10, zIndex: 2, borderRadius: 999 }}
        onClick={() => scrollBy(420)}
        aria-label={rightLabel}
      >
        <i className="bi bi-chevron-right" />
      </button>
    </div>
  );
}

function ProductCard({ p }) {
  return (
    <div className="snap-card" style={{ width: 220 }}>
      <div className="card card-soft h-100 overflow-hidden">
        <div className="position-relative img-ph" style={{ height: 140 }}>
          {p.off ? (
            <span className="badge bg-danger position-absolute top-0 start-0 m-2 rounded-pill px-3 py-2">
              {p.off}% OFF
            </span>
          ) : null}
        </div>

        <div className="p-3">
          <div className="small text-secondary mb-1">{p.tag}</div>
          <div className="fw-semibold" style={{ fontSize: 14, minHeight: 38 }}>
            {p.name}
          </div>

          <div className="d-flex align-items-center gap-2 mt-1">
            <div className="fw-bold">NPR {p.price}</div>
            <div className="text-secondary small text-decoration-line-through">NPR {p.oldPrice}</div>
          </div>

          <div className="d-grid mt-3">
            <button className="btn btn-brand btn-sm rounded-pill">Add to cart</button>
          </div>

          <div className="d-flex justify-content-between mt-2">
            <Link className="small text-decoration-none" style={{ color: "var(--brand)" }} to="/products">
              View
            </Link>
            <button className="btn btn-link btn-sm p-0 text-secondary" type="button" aria-label="wishlist">
              <i className="bi bi-heart" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="hero-grad">
      {/* SEARCH-FIRST HERO */}
      <section className="container py-4 py-md-5">
        <div className="row g-3 align-items-center">
          <div className="col-lg-7">
            <div className="badge badge-soft rounded-pill px-3 py-2 mb-3">
              Pharmacy + Skincare • COD delivery • Trusted brands
            </div>
            <h1 className="display-6 fw-bold">
              What are you looking for today?
            </h1>
            <p className="text-secondary fs-5 mt-2 mb-4">
              Shop skincare, wellness, and pharmacy essentials with a clean, fast checkout.
            </p>

            {/* this uses your Navbar search too, but we keep one here like PharmEasy */}
            <div className="card card-soft p-3">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-search text-secondary" />
                <input className="form-control border-0 shadow-none" placeholder="Search products, brands, categories..." />
                <Link to="/products" className="btn btn-brand rounded-pill px-4">
                  Search
                </Link>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-3">
                {["Sunscreen", "Moisturizer", "Vitamins", "Pain relief", "Cleanser"].map((x) => (
                  <Link key={x} to={`/products?q=${encodeURIComponent(x)}`} className="text-decoration-none">
                    <span className="badge badge-soft rounded-pill px-3 py-2">{x}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* quick actions */}
            <div className="row g-2 mt-3">
              {quickActions.map((a) => (
                <div className="col-6 col-md-4" key={a.title}>
                  <Link to={a.href} className="text-decoration-none">
                    <div className="pill h-100">
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${a.icon}`} style={{ color: "var(--brand)" }} />
                        <div>
                          <div className="fw-semibold text-dark" style={{ fontSize: 14 }}>{a.title}</div>
                          <div className="small text-secondary">{a.note}</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* right info card */}
          <div className="col-lg-5">
            <div className="card card-soft p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="small text-secondary">Today’s highlight</div>
                  <div className="fw-bold fs-4 mt-1">Skincare Routine</div>
                  <div className="text-secondary mt-2">
                    Cleanse → Treat → Moisturize → Protect. Simple, effective, repeat.
                  </div>
                </div>
                <span className="badge bg-dark rounded-pill px-3 py-2">Trending</span>
              </div>

              <div className="row g-2 mt-3">
                {["Cleanser", "Serum", "Moisturizer", "Sunscreen"].map((x) => (
                  <div className="col-6" key={x}>
                    <div className="border rounded-4 p-3" style={{ borderColor: "rgba(15,23,42,.08)" }}>
                      <div className="fw-semibold">{x}</div>
                      <div className="small text-secondary">Curated picks</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex gap-2 mt-4">
                <Link to="/products?category=skincare" className="btn btn-brand rounded-pill px-4">
                  Shop skincare
                </Link>
                <Link to="/brands" className="btn btn-outline-secondary rounded-pill px-4">
                  Brands
                </Link>
              </div>

              <div className="small text-secondary mt-3">
                Some items may require prescription. Always follow label instructions.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LAB TESTS / HEALTH CONCERNS (horizontal scroll) */}
      <section className="container pb-4">
        <SectionHeader
          title="Lab tests by health concern"
          subtitle="Quick picks based on common concerns."
          actionHref="/labs"
          actionText="Explore"
        />

        <HorizontalRow
          items={healthConcerns}
          renderItem={(c) => (
            <div className="snap-card" style={{ width: 200 }} key={c.title}>
              <Link to={c.href} className="text-decoration-none">
                <div className="card card-soft p-3 h-100">
                  <div className="d-flex align-items-center justify-content-between">
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{
                        width: 44,
                        height: 44,
                        background: "rgba(43,138,126,.10)",
                        border: "1px solid rgba(43,138,126,.16)",
                      }}
                    >
                      <i className={`bi ${c.icon}`} style={{ color: "var(--brand)" }} />
                    </div>
                    <i className="bi bi-arrow-right text-secondary" />
                  </div>
                  <div className="fw-semibold text-dark mt-3">{c.title}</div>
                  <div className="small text-secondary mt-1">View options</div>
                </div>
              </Link>
            </div>
          )}
        />
      </section>

      {/* SHOP BY CATEGORIES */}
      <section className="container pb-5">
        <SectionHeader
          title="Shop by categories"
          subtitle="Browse fast with popular categories."
          actionHref="/products"
          actionText="See all"
        />

        <div className="card card-soft p-3">
          <div className="row g-2">
            {categories.map((c) => (
              <div className="col-6 col-md-3 col-lg-2" key={c.title}>
                <Link to={c.href} className="text-decoration-none">
                  <div className="p-3 rounded-4 h-100" style={{ border: "1px solid rgba(15,23,42,.06)" }}>
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${c.icon}`} style={{ color: "var(--brand)" }} />
                      <div className="fw-semibold text-dark" style={{ fontSize: 14 }}>{c.title}</div>
                    </div>
                    <div className="small text-secondary mt-2">Explore</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW LAUNCHES (product slider) */}
      <section className="container pb-4">
        <SectionHeader
          title="New launches"
          subtitle="Fresh drops across skincare and essentials."
          actionHref="/products"
          actionText="View all"
        />
        <HorizontalRow
          items={products1}
          renderItem={(p) => <ProductCard key={p.id} p={p} />}
        />
      </section>

      {/* TRENDING */}
      <section className="container pb-5">
        <SectionHeader
          title="Trending near you"
          subtitle="Popular picks people are adding to cart."
          actionHref="/products"
          actionText="View all"
        />
        <HorizontalRow
          items={products2}
          renderItem={(p) => <ProductCard key={p.id} p={p} />}
        />
      </section>

      {/* SOFT BLOCK: TRUST / WHY CHOOSE US */}
      <section className="soft-block py-5">
        <div className="container">
          <div className="row g-3 align-items-stretch">
            <div className="col-lg-6">
              <h2 className="h4 fw-bold mb-2">Why choose us?</h2>
              <div className="text-secondary mb-3">
                Clean shopping experience with reliable delivery and clear policies.
              </div>

              <div className="row g-3">
                {[
                  { title: "Verified products", note: "Trusted suppliers", icon: "bi-shield-check" },
                  { title: "COD delivery", note: "Ring road pricing", icon: "bi-truck" },
                  { title: "Easy cancellations", note: "Rules applied", icon: "bi-arrow-counterclockwise" },
                  { title: "Support", note: "Chat/Call assistance", icon: "bi-headset" },
                ].map((x) => (
                  <div className="col-6" key={x.title}>
                    <div className="card card-soft p-3 h-100">
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${x.icon}`} style={{ color: "var(--brand)" }} />
                        <div>
                          <div className="fw-semibold">{x.title}</div>
                          <div className="small text-secondary">{x.note}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card card-soft p-4 h-100">
                <div className="fw-bold fs-5">Offers + skincare tips</div>
                <div className="text-secondary mt-1">
                  Weekly deals, routines, and new launches. No spam.
                </div>

                <div className="d-flex gap-2 mt-3">
                  <input className="form-control rounded-pill" placeholder="Enter your email" type="email" />
                  <button className="btn btn-brand rounded-pill px-4" type="button">
                    Subscribe
                  </button>
                </div>

                <div className="small text-secondary mt-2">
                  By subscribing, you agree to our privacy policy.
                </div>

                <hr className="my-4" style={{ borderColor: "rgba(15,23,42,.08)" }} />

                <div className="row g-3 text-center">
                  <div className="col-4">
                    <div className="fw-bold">2k+</div>
                    <div className="small text-secondary">Customers</div>
                  </div>
                  <div className="col-4">
                    <div className="fw-bold">300+</div>
                    <div className="small text-secondary">Products</div>
                  </div>
                  <div className="col-4">
                    <div className="fw-bold">4.7</div>
                    <div className="small text-secondary">Avg rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="container py-5">
        <SectionHeader
          title="Health articles"
          subtitle="Quick reads curated for you."
          actionHref="/blogs"
          actionText="View all"
        />

        <div className="row g-3">
          {articles.map((a) => (
            <div className="col-12 col-md-6 col-lg-3" key={a.title}>
              <Link to="/blogs" className="text-decoration-none">
                <div className="card card-soft h-100 overflow-hidden">
                  <div className="img-ph" style={{ height: 140 }} />
                  <div className="p-3">
                    <span className="badge badge-soft rounded-pill">{a.tag}</span>
                    <div className="fw-semibold text-dark mt-2">{a.title}</div>
                    <div className="small text-secondary mt-1">Read in 2 min</div>
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
