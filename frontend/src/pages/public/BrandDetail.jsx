import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";

const demoBrands = [
  { name: "COSRX", slug: "cosrx", desc: "K-beauty essentials for calm skin" },
  { name: "CeraVe", slug: "cerave", desc: "Barrier repair with ceramides" },
  { name: "Cetaphil", slug: "cetaphil", desc: "Gentle care for sensitive skin" },
  { name: "La Roche-Posay", slug: "la-roche-posay", desc: "Dermatologist-loved skincare" },
  { name: "The Ordinary", slug: "the-ordinary", desc: "Actives that work, transparent formulas" },
  { name: "Bioderma", slug: "bioderma", desc: "Micellar and sensitive skin staples" },
];

const demoProducts = [
  { id: 1, brand: "cosrx", name: "Low pH Good Morning Cleanser", price: 899, oldPrice: 1099, off: 18, tag: "Best seller" },
  { id: 2, brand: "cosrx", name: "Advanced Snail 96 Mucin", price: 1699, oldPrice: 1999, off: 15, tag: "Trending" },
  { id: 3, brand: "cerave", name: "Moisturizing Cream", price: 1599, oldPrice: 1899, off: 16, tag: "Barrier repair" },
  { id: 4, brand: "cerave", name: "Foaming Cleanser", price: 1299, oldPrice: 1499, off: 13, tag: "Daily" },
  { id: 5, brand: "cetaphil", name: "Gentle Skin Cleanser", price: 999, oldPrice: 1199, off: 17, tag: "Sensitive" },
  { id: 6, brand: "cetaphil", name: "Moisturizing Lotion", price: 1099, oldPrice: 1299, off: 15, tag: "Hydration" },
  { id: 7, brand: "bioderma", name: "Micellar Water (Sensibio)", price: 1499, oldPrice: 1799, off: 16, tag: "Classic" },
  { id: 8, brand: "the-ordinary", name: "Niacinamide 10% + Zinc", price: 1399, oldPrice: 1699, off: 18, tag: "Oil control" },
];

function BrandLogo({ name }) {
  const initial = name?.[0]?.toUpperCase() || "B";
  return (
    <div
      className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
      style={{
        width: 52,
        height: 52,
        background: "rgba(43,138,126,.12)",
        border: "1px solid rgba(43,138,126,.18)",
        color: "var(--brand)",
      }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

function ProductCard({ p }) {
  return (
    <div className="card card-soft h-100 overflow-hidden">
      <div className="img-ph position-relative" style={{ height: 160 }}>
        <span className="badge bg-danger position-absolute top-0 start-0 m-2 rounded-pill px-3 py-2">
          {p.off}% OFF
        </span>
      </div>
      <div className="p-3">
        <div className="small text-secondary">{p.tag}</div>
        <div className="fw-semibold mt-1" style={{ minHeight: 40 }}>{p.name}</div>

        <div className="d-flex align-items-center gap-2 mt-1">
          <div className="fw-bold">NPR {p.price}</div>
          <div className="text-secondary small text-decoration-line-through">NPR {p.oldPrice}</div>
        </div>

        <div className="d-grid mt-3">
          <button className="btn btn-brand btn-sm rounded-pill">Add to cart</button>
        </div>
      </div>
    </div>
  );
}

export default function BrandDetail() {
  const { slug } = useParams();
  const [sort, setSort] = useState("popular");

  const brand = useMemo(() => demoBrands.find((b) => b.slug === slug), [slug]);

  const products = useMemo(() => {
    let list = demoProducts.filter((p) => p.brand === slug);

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [slug, sort]);

  if (!brand) {
    return (
      <div className="container py-5">
        <div className="card card-soft p-4">
          <div className="fw-bold">Brand not found</div>
          <div className="text-secondary mt-1">This brand does not exist.</div>
          <div className="mt-3">
            <Link to="/brands" className="btn btn-outline-secondary rounded-pill">
              Back to brands
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Brand hero */}
      <section className="soft-block py-5">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <BrandLogo name={brand.name} />
              <div>
                <div className="small text-secondary">Brand</div>
                <h1 className="h3 fw-bold mb-1">{brand.name}</h1>
                <div className="text-secondary">{brand.desc}</div>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <span className="badge badge-soft rounded-pill px-3 py-2">Verified</span>
              <span className="badge badge-soft rounded-pill px-3 py-2">Best sellers</span>
              <span className="badge badge-soft rounded-pill px-3 py-2">Skincare</span>
            </div>
          </div>

          <div className="card card-soft p-3 mt-4">
            <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-search text-secondary ms-2" />
                <input className="form-control border-0 shadow-none" placeholder={`Search in ${brand.name}...`} />
              </div>

              <div className="d-flex gap-2 align-items-center">
                <div className="small text-secondary">Sort</div>
                <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="popular">Popular</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="container py-4 py-md-5">
        <div className="d-flex align-items-end justify-content-between mb-3">
          <div>
            <h2 className="h4 fw-bold mb-1">Products</h2>
            <div className="text-secondary">Showing {products.length} items</div>
          </div>
          <Link to="/brands" className="text-decoration-none" style={{ color: "var(--brand)" }}>
            Back to brands <i className="bi bi-arrow-right" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="card card-soft p-4">
            <div className="fw-semibold">No products yet</div>
            <div className="text-secondary mt-1">We’ll show products when backend is connected.</div>
          </div>
        ) : (
          <div className="row g-3">
            {products.map((p) => (
              <div className="col-6 col-md-4 col-lg-3" key={p.id}>
                <ProductCard p={p} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
