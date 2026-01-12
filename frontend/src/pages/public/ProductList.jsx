import { Link, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";

const demoBrands = [
  { id: "b1", name: "COSRX", slug: "cosrx" },
  { id: "b2", name: "CeraVe", slug: "cerave" },
  { id: "b3", name: "Cetaphil", slug: "cetaphil" },
  { id: "b4", name: "Bioderma", slug: "bioderma" },
  { id: "b5", name: "The Ordinary", slug: "the-ordinary" },
];

const demoCategories = [
  { id: "c1", name: "Skincare", slug: "skincare" },
  { id: "c2", name: "Wellness", slug: "wellness" },
  { id: "c3", name: "Haircare", slug: "haircare" },
  { id: "c4", name: "First Aid", slug: "first-aid" },
  { id: "c5", name: "Personal Care", slug: "personal-care" },
];

const demoProducts = [
  { id: 1, slug: "spf-50-sunscreen", name: "SPF 50 Sunscreen", price: 1199, oldPrice: 1499, off: 20, rating: 4.8, brandSlug: "bioderma", catSlug: "skincare", inStock: true, tag: "Best seller" },
  { id: 2, slug: "ceramide-moisturizer", name: "Ceramide Moisturizer", price: 1299, oldPrice: 1599, off: 18, rating: 4.6, brandSlug: "cerave", catSlug: "skincare", inStock: true, tag: "Barrier repair" },
  { id: 3, slug: "hydrating-cleanser", name: "Hydrating Cleanser", price: 899, oldPrice: 1099, off: 15, rating: 4.7, brandSlug: "cetaphil", catSlug: "skincare", inStock: true, tag: "Gentle" },
  { id: 4, slug: "vitamin-c-serum", name: "Vitamin C Serum", price: 1599, oldPrice: 1999, off: 20, rating: 4.5, brandSlug: "the-ordinary", catSlug: "skincare", inStock: true, tag: "Glow" },
  { id: 5, slug: "multivitamin-gummies", name: "Multivitamin Gummies", price: 799, oldPrice: 999, off: 20, rating: 4.4, brandSlug: "cosrx", catSlug: "wellness", inStock: true, tag: "Wellness" },
  { id: 6, slug: "antiseptic-spray", name: "Antiseptic Spray", price: 299, oldPrice: 399, off: 25, rating: 4.3, brandSlug: "cetaphil", catSlug: "first-aid", inStock: true, tag: "First aid" },
  { id: 7, slug: "gentle-shampoo", name: "Gentle Shampoo", price: 649, oldPrice: 799, off: 19, rating: 4.2, brandSlug: "bioderma", catSlug: "haircare", inStock: true, tag: "Haircare" },
  { id: 8, slug: "lip-balm-repair", name: "Lip Balm Repair", price: 249, oldPrice: 299, off: 17, rating: 4.6, brandSlug: "cosrx", catSlug: "personal-care", inStock: false, tag: "Repair" },
  { id: 9, slug: "niacinamide-serum", name: "Niacinamide Serum", price: 1399, oldPrice: 1699, off: 18, rating: 4.6, brandSlug: "the-ordinary", catSlug: "skincare", inStock: true, tag: "Oil control" },
  { id: 10, slug: "hyaluronic-acid", name: "Hyaluronic Acid Serum", price: 1499, oldPrice: 1799, off: 16, rating: 4.5, brandSlug: "the-ordinary", catSlug: "skincare", inStock: true, tag: "Hydration" },
  { id: 11, slug: "hand-sanitizer", name: "Hand Sanitizer", price: 149, oldPrice: 199, off: 25, rating: 4.1, brandSlug: "cetaphil", catSlug: "personal-care", inStock: true, tag: "Hygiene" },
  { id: 12, slug: "ors-sachets", name: "ORS Sachets", price: 90, oldPrice: 110, off: 18, rating: 4.2, brandSlug: "bioderma", catSlug: "wellness", inStock: true, tag: "Essentials" },
];

function Badge({ children }) {
  return <span className="badge badge-soft rounded-pill px-3 py-2">{children}</span>;
}

function ProductCard({ p }) {
  return (
    <div className="card card-soft h-100 overflow-hidden">
      <div className="position-relative img-ph" style={{ height: 160 }}>
        {p.off ? (
          <span className="badge bg-danger position-absolute top-0 start-0 m-2 rounded-pill px-3 py-2">
            {p.off}% OFF
          </span>
        ) : null}
        {!p.inStock ? (
          <span className="badge bg-dark position-absolute top-0 end-0 m-2 rounded-pill px-3 py-2">
            Out of stock
          </span>
        ) : null}
      </div>

      <div className="p-3">
        <div className="small text-secondary">{p.tag}</div>
        <div className="fw-semibold mt-1" style={{ minHeight: 42 }}>
          {p.name}
        </div>

        <div className="d-flex align-items-center gap-2 mt-1">
          <div className="fw-bold">NPR {p.price}</div>
          <div className="text-secondary small text-decoration-line-through">NPR {p.oldPrice}</div>
        </div>

        <div className="d-flex align-items-center gap-1 small text-secondary mt-2">
          <i className="bi bi-star-fill" style={{ color: "var(--accent)" }} />
          {p.rating}
        </div>

        <div className="d-grid mt-3">
          <button className="btn btn-brand btn-sm rounded-pill" disabled={!p.inStock}>
            Add to cart
          </button>
        </div>

        <div className="d-flex justify-content-between mt-2">
          <Link className="small text-decoration-none" style={{ color: "var(--brand)" }} to={`/products/${p.slug}`}>
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
  const initialCategory = searchParams.get("category") || "";
  const initialBrand = searchParams.get("brand") || "";

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState(initialBrand);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);

  const pageSize = 8;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let list = demoProducts.filter((p) => {
      const matchesQ = s ? p.name.toLowerCase().includes(s) : true;
      const matchesCat = category ? p.catSlug === category : true;
      const matchesBrand = brand ? p.brandSlug === brand : true;
      const matchesStock = inStockOnly ? p.inStock : true;
      return matchesQ && matchesCat && matchesBrand && matchesStock;
    });

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "discount") list = [...list].sort((a, b) => (b.off || 0) - (a.off || 0));
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  }, [q, category, brand, inStockOnly, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const clearFilters = () => {
    setQ("");
    setCategory("");
    setBrand("");
    setInStockOnly(false);
    setSort("popular");
    setPage(1);
  };

  return (
    <div className="container py-4 py-md-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Products</h1>
          <div className="text-secondary">
            Browse skincare + pharmacy essentials. Use filters to find faster.
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
              <button className="btn btn-light border rounded-pill px-3 me-2" type="button" onClick={() => setQ("")}>
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Filters */}
        <div className="col-12 col-lg-3">
          <div className="card card-soft p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="fw-bold">Filters</div>
              <button className="btn btn-link p-0 text-decoration-none" style={{ color: "var(--brand)" }} onClick={clearFilters} type="button">
                Reset
              </button>
            </div>

            <div className="mb-3">
              <div className="small text-secondary mb-1">Category</div>
              <select
                className="form-select"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {demoCategories.map((c) => (
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
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {demoBrands.map((b) => (
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
                <Badge>Best sellers</Badge>
                <Badge>Skincare</Badge>
                <Badge>Wellness</Badge>
                <Badge>Under NPR 500</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div className="col-12 col-lg-9">
          <div className="card card-soft p-3 mb-3">
            <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center justify-content-between">
              <div className="text-secondary">
                Showing <b>{filtered.length}</b> products
                {category ? ` in "${category}"` : ""}{brand ? ` by "${brand}"` : ""}.
              </div>

              <div className="d-flex gap-2 align-items-center">
                <div className="small text-secondary">Sort</div>
                <select
                  className="form-select"
                  style={{ width: 220 }}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="popular">Popular</option>
                  <option value="rating">Top rated</option>
                  <option value="discount">Highest discount</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {pageItems.length === 0 ? (
            <div className="card card-soft p-4">
              <div className="fw-semibold">No products found</div>
              <div className="text-secondary mt-1">Try removing some filters or changing the search.</div>
            </div>
          ) : (
            <div className="row g-3">
              {pageItems.map((p) => (
                <div className="col-6 col-md-4 col-xl-3" key={p.id}>
                  <ProductCard p={p} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-4">
            <nav aria-label="Products pagination">
              <ul className="pagination">
                <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage((x) => Math.max(1, x - 1))} type="button">
                    Prev
                  </button>
                </li>

                {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                  const p = i + 1;
                  return (
                    <li key={p} className={`page-item ${page === p ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setPage(p)} type="button">
                        {p}
                      </button>
                    </li>
                  );
                })}

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
