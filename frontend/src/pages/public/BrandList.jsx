import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

const demoBrands = [
  { name: "COSRX", slug: "cosrx", desc: "K-beauty essentials for calm skin" },
  { name: "CeraVe", slug: "cerave", desc: "Barrier repair with ceramides" },
  { name: "Cetaphil", slug: "cetaphil", desc: "Gentle care for sensitive skin" },
  { name: "La Roche-Posay", slug: "la-roche-posay", desc: "Dermatologist-loved skincare" },
  { name: "The Ordinary", slug: "the-ordinary", desc: "Actives that work, transparent formulas" },
  { name: "Bioderma", slug: "bioderma", desc: "Micellar and sensitive skin staples" },
  { name: "Eucerin", slug: "eucerin", desc: "Clinical skincare for daily concerns" },
  { name: "Neutrogena", slug: "neutrogena", desc: "Hydration and acne solutions" },
  { name: "Nivea", slug: "nivea", desc: "Everyday body and face care" },
  { name: "PanOxyl", slug: "panoxyl", desc: "Acne wash favorites" },
  { name: "Avene", slug: "avene", desc: "Soothing thermal water skincare" },
  { name: "Vaseline", slug: "vaseline", desc: "Repair and protect dry skin" },
];

const letters = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function BrandLogo({ name }) {
  const initial = name?.[0]?.toUpperCase() || "B";
  return (
    <div
      className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
      style={{
        width: 44,
        height: 44,
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

export default function BrandList() {
  const [q, setQ] = useState("");
  const [activeLetter, setActiveLetter] = useState("#");

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    return demoBrands
      .filter((b) => (search ? b.name.toLowerCase().includes(search) : true))
      .filter((b) => {
        if (activeLetter === "#") return true;
        return b.name[0].toUpperCase() === activeLetter;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [q, activeLetter]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const b of filtered) {
      const key = b.name[0].toUpperCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(b);
    }
    return map;
  }, [filtered]);

  return (
    <div className="container py-4 py-md-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Brands</h1>
          <div className="text-secondary">Explore trusted pharmacy and skincare brands.</div>
        </div>

        {/* Search */}
        <div className="card card-soft p-2" style={{ minWidth: 280 }}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-search text-secondary ms-2" />
            <input
              className="form-control border-0 shadow-none"
              placeholder="Search brands..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q ? (
              <button
                className="btn btn-light border rounded-pill px-3 me-2"
                type="button"
                onClick={() => setQ("")}
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* A-Z filter */}
      <div className="card card-soft p-3 mb-4">
        <div className="d-flex flex-wrap gap-2">
          {letters.map((L) => (
            <button
              key={L}
              type="button"
              className={`btn btn-sm rounded-pill ${
                activeLetter === L ? "btn-brand" : "btn-outline-secondary"
              }`}
              onClick={() => setActiveLetter(L)}
            >
              {L}
            </button>
          ))}
        </div>
        <div className="small text-secondary mt-2">
          Tip: Use A–Z to jump quickly. “#” shows all.
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="card card-soft p-4">
          <div className="fw-semibold">No brands found</div>
          <div className="text-secondary mt-1">Try a different keyword.</div>
        </div>
      ) : (
        <div className="row g-3">
          {/* Left: grouped list */}
          <div className="col-12 col-lg-4">
            <div className="card card-soft p-3">
              <div className="fw-bold mb-2">Browse</div>
              <div className="small text-secondary mb-3">
                Click a brand to view products.
              </div>

              <div className="d-grid gap-2">
                {Array.from(grouped.keys())
                  .sort()
                  .map((key) => (
                    <div key={key}>
                      <div className="small text-secondary fw-semibold mb-2">{key}</div>
                      <div className="d-grid gap-2">
                        {grouped.get(key).map((b) => (
                          <Link
                            key={b.slug}
                            to={`/brands/${b.slug}`}
                            className="text-decoration-none"
                          >
                            <div className="p-3 rounded-4" style={{ border: "1px solid rgba(15,23,42,.06)" }}>
                              <div className="d-flex align-items-center gap-3">
                                <BrandLogo name={b.name} />
                                <div className="flex-grow-1">
                                  <div className="fw-semibold text-dark">{b.name}</div>
                                  <div className="small text-secondary">{b.desc}</div>
                                </div>
                                <i className="bi bi-chevron-right text-secondary" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <hr className="my-3" style={{ borderColor: "rgba(15,23,42,.08)" }} />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right: cards grid */}
          <div className="col-12 col-lg-8">
            <div className="row g-3">
              {filtered.map((b) => (
                <div className="col-12 col-md-6" key={b.slug}>
                  <Link to={`/brands/${b.slug}`} className="text-decoration-none">
                    <div className="card card-soft p-4 h-100">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <BrandLogo name={b.name} />
                          <div>
                            <div className="fw-bold text-dark">{b.name}</div>
                            <div className="text-secondary small">{b.desc}</div>
                          </div>
                        </div>
                        <span className="badge badge-soft rounded-pill px-3 py-2">View</span>
                      </div>

                      <div className="mt-3 d-flex flex-wrap gap-2">
                        {["Best sellers", "New", "Skincare"].map((x) => (
                          <span key={x} className="badge badge-soft rounded-pill px-3 py-2">
                            {x}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <div className="small text-secondary mt-3">
              Showing <b>{filtered.length}</b> brands
              {activeLetter !== "#" ? ` for "${activeLetter}"` : ""}.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
