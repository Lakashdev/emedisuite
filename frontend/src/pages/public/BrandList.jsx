import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

/* ─── BRAND CSS ─── */
const BRAND_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Lora:wght@400;600;700&display=swap');

.ms-brands-root {
  font-family: 'Plus Jakarta Sans', sans-serif;
  --navy: #1B3D6E;
  --navy-dark: #142E55;
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
  color: var(--text-main);
  background: var(--off-white);
  min-height: 100vh;
}

/* Page header */
.ms-brands-header {
  background: linear-gradient(135deg, var(--navy) 0%, #2A5298 100%);
  padding: 40px 0 32px;
  margin-bottom: 36px;
  position: relative;
  overflow: hidden;
}
.ms-brands-header::before {
  content: '';
  position: absolute;
  width: 400px; height: 400px;
  border-radius: 50%;
  background: rgba(107,191,78,.08);
  right: -80px; top: -120px;
  pointer-events: none;
}
.ms-brands-header::after {
  content: '';
  position: absolute;
  width: 240px; height: 240px;
  border-radius: 50%;
  background: rgba(255,255,255,.04);
  left: 10%; bottom: -60px;
  pointer-events: none;
}
.ms-brands-eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--green);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.ms-brands-eyebrow::before {
  content: '';
  display: block;
  width: 22px; height: 2px;
  background: var(--green);
  flex-shrink: 0;
}
.ms-brands-title {
  font-family: 'Lora', serif;
  font-size: clamp(26px, 3.5vw, 38px);
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
  letter-spacing: -0.025em;
  position: relative;
  z-index: 1;
}
.ms-brands-sub {
  font-size: 14.5px;
  color: rgba(255,255,255,.65);
  margin: 0 0 28px;
  font-weight: 400;
  position: relative;
  z-index: 1;
}
.ms-brands-search-wrap {
  background: rgba(255,255,255,.12);
  border: 1.5px solid rgba(255,255,255,.2);
  border-radius: 12px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 400px;
  backdrop-filter: blur(8px);
  transition: border-color .2s, background .2s;
  position: relative;
  z-index: 1;
}
.ms-brands-search-wrap:focus-within {
  border-color: var(--green);
  background: rgba(255,255,255,.18);
}
.ms-brands-search-icon { color: rgba(255,255,255,.6); font-size: 14px; flex-shrink: 0; }
.ms-brands-search-input {
  border: none;
  outline: none;
  background: transparent;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  color: #fff;
  flex: 1;
  min-width: 0;
}
.ms-brands-search-input::placeholder { color: rgba(255,255,255,.45); }
.ms-brands-search-clear {
  background: rgba(255,255,255,.15);
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background .2s;
}
.ms-brands-search-clear:hover { background: rgba(255,255,255,.25); }

/* A-Z filter bar */
.ms-az-bar {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 18px 20px 14px;
  margin-bottom: 28px;
}
.ms-az-bar-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--text-muted);
  margin-bottom: 12px;
}
.ms-az-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.ms-az-btn {
  width: 34px; height: 34px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: var(--off-white);
  font-size: 12.5px;
  font-weight: 800;
  color: var(--text-mid);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background .15s, border-color .15s, color .15s;
}
.ms-az-btn:hover { background: var(--navy-light); border-color: var(--navy); color: var(--navy); }
.ms-az-btn.active {
  background: var(--navy);
  border-color: var(--navy);
  color: var(--white);
}
.ms-az-hint {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ms-az-hint i { color: var(--green-dark); }

/* Brand logo */
.ms-brand-logo {
  width: 46px; height: 46px;
  border-radius: 12px;
  background: var(--navy-light);
  border: 1.5px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Lora', serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--navy);
  flex-shrink: 0;
  transition: background .2s, border-color .2s;
}

/* Sidebar list */
.ms-sidebar-card {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 22px;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}
.ms-sidebar-card::-webkit-scrollbar { width: 4px; }
.ms-sidebar-card::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }
.ms-sidebar-heading {
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--navy);
  margin-bottom: 4px;
  display: flex; align-items: center; gap: 7px;
}
.ms-sidebar-heading i { color: var(--green-dark); }
.ms-sidebar-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 18px;
}
.ms-alpha-group-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--text-muted);
  margin-bottom: 6px;
  margin-top: 14px;
}
.ms-alpha-group-label:first-child { margin-top: 0; }
.ms-sidebar-brand-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  transition: background .15s;
  margin-bottom: 2px;
}
.ms-sidebar-brand-item:hover { background: var(--navy-light); }
.ms-sidebar-brand-item .ms-brand-logo { width: 36px; height: 36px; font-size: 14px; border-radius: 9px; }
.ms-sidebar-brand-name { font-size: 13.5px; font-weight: 600; color: var(--text-main); }
.ms-sidebar-brand-desc { font-size: 11.5px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
.ms-sidebar-chevron { margin-left: auto; color: var(--text-muted); font-size: 12px; flex-shrink: 0; }
.ms-sidebar-divider { border: none; border-top: 1.5px solid var(--border); margin: 10px 0 14px; }

/* Brand cards grid */
.ms-brand-card {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-decoration: none;
  transition: transform .2s, box-shadow .2s, border-color .2s;
  height: 100%;
}
.ms-brand-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 36px rgba(27,61,110,.11);
  border-color: #BDD4EA;
}
.ms-brand-card:hover .ms-brand-logo {
  background: var(--navy);
  border-color: var(--navy);
  color: var(--white);
}
.ms-brand-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ms-brand-card-info { flex: 1; min-width: 0; margin-left: 12px; }
.ms-brand-card-name {
  font-family: 'Lora', serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 3px;
}
.ms-brand-card-desc {
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.45;
}
.ms-view-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--navy-light);
  border: 1.5px solid var(--border);
  font-size: 12px;
  font-weight: 700;
  color: var(--navy);
  flex-shrink: 0;
  transition: background .2s, color .2s;
}
.ms-brand-card:hover .ms-view-badge { background: var(--navy); color: var(--white); }
.ms-brand-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border-top: 1.5px solid var(--border);
  padding-top: 12px;
}
.ms-brand-tag {
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 11px;
  border-radius: 999px;
  background: var(--green-light);
  color: var(--green-dark);
  border: 1.5px solid rgba(107,191,78,.25);
}

/* Empty */
.ms-empty {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 52px 32px;
  text-align: center;
}
.ms-empty-icon { font-size: 38px; color: var(--border); display: block; margin-bottom: 12px; }
.ms-empty-title { font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 6px; }
.ms-empty-sub { font-size: 13.5px; color: var(--text-muted); }

/* Count line */
.ms-count-line {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 16px;
  font-weight: 500;
}
.ms-count-line b { color: var(--navy); font-weight: 800; }
`;

const demoBrands = [
  { name: "COSRX", slug: "cosrx", desc: "K-beauty essentials for calm skin", tags: ["Skincare", "Best seller", "K-Beauty"] },
  { name: "CeraVe", slug: "cerave", desc: "Barrier repair with ceramides", tags: ["Skincare", "Dermatologist"] },
  { name: "Cetaphil", slug: "cetaphil", desc: "Gentle care for sensitive skin", tags: ["Gentle", "Sensitive"] },
  { name: "La Roche-Posay", slug: "la-roche-posay", desc: "Dermatologist-loved skincare", tags: ["Dermatologist", "Sun Care"] },
  { name: "The Ordinary", slug: "the-ordinary", desc: "Actives that work, transparent formulas", tags: ["Actives", "Affordable"] },
  { name: "Bioderma", slug: "bioderma", desc: "Micellar and sensitive skin staples", tags: ["Micellar", "Sensitive"] },
  { name: "Eucerin", slug: "eucerin", desc: "Clinical skincare for daily concerns", tags: ["Clinical", "Hydration"] },
  { name: "Neutrogena", slug: "neutrogena", desc: "Hydration and acne solutions", tags: ["Acne", "Hydration"] },
  { name: "Nivea", slug: "nivea", desc: "Everyday body and face care", tags: ["Body Care", "Everyday"] },
  { name: "PanOxyl", slug: "panoxyl", desc: "Acne wash favorites", tags: ["Acne", "Wash"] },
  { name: "Avene", slug: "avene", desc: "Soothing thermal water skincare", tags: ["Soothing", "Thermal"] },
  { name: "Vaseline", slug: "vaseline", desc: "Repair and protect dry skin", tags: ["Repair", "Dry Skin"] },
];

const letters = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function BrandLogo({ name }) {
  const initial = name?.[0]?.toUpperCase() || "B";
  return <div className="ms-brand-logo" aria-hidden="true">{initial}</div>;
}

export default function BrandList() {
  const [q, setQ] = useState("");
  const [activeLetter, setActiveLetter] = useState("#");

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    return demoBrands
      .filter((b) => (search ? b.name.toLowerCase().includes(search) : true))
      .filter((b) => (activeLetter === "#" ? true : b.name[0].toUpperCase() === activeLetter))
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
    <div className="ms-brands-root">
      <style>{BRAND_CSS}</style>

      {/* ── HEADER ── */}
      <div className="ms-brands-header">
        <div className="container">
          <div className="ms-brands-eyebrow">Medisuite Pharmacy</div>
          <h1 className="ms-brands-title">Our Brands</h1>
          <p className="ms-brands-sub">Explore trusted pharmacy and skincare brands, all verified and genuine.</p>
          <div className="ms-brands-search-wrap">
            <i className="bi bi-search ms-brands-search-icon" />
            <input
              className="ms-brands-search-input"
              placeholder="Search brands…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button className="ms-brands-search-clear" type="button" onClick={() => setQ("")}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container pb-5">
        {/* ── A-Z BAR ── */}
        <div className="ms-az-bar">
          <div className="ms-az-bar-label">Browse A–Z</div>
          <div className="ms-az-buttons">
            {letters.map((L) => (
              <button
                key={L}
                type="button"
                className={`ms-az-btn ${activeLetter === L ? "active" : ""}`}
                onClick={() => setActiveLetter(L)}
              >
                {L}
              </button>
            ))}
          </div>
          <div className="ms-az-hint">
            <i className="bi bi-info-circle-fill" />
            Select a letter to filter brands. "#" shows all brands.
          </div>
        </div>

        {/* ── RESULTS ── */}
        {filtered.length === 0 ? (
          <div className="ms-empty">
            <i className="bi bi-shop ms-empty-icon" />
            <div className="ms-empty-title">No brands found</div>
            <div className="ms-empty-sub">Try a different keyword or select "#" to see all brands.</div>
          </div>
        ) : (
          <div className="row g-4">
            {/* Sidebar grouped list */}
            <div className="col-12 col-lg-4">
              <div className="ms-sidebar-card">
                <div className="ms-sidebar-heading">
                  <i className="bi bi-list-ul" />Browse
                </div>
                <div className="ms-sidebar-sub">Click any brand to view their products.</div>

                {Array.from(grouped.keys()).sort().map((key) => (
                  <div key={key}>
                    <div className="ms-alpha-group-label">{key}</div>
                    {grouped.get(key).map((b) => (
                      <Link key={b.slug} to={`/brands/${b.slug}`} className="ms-sidebar-brand-item">
                        <BrandLogo name={b.name} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="ms-sidebar-brand-name">{b.name}</div>
                          <div className="ms-sidebar-brand-desc">{b.desc}</div>
                        </div>
                        <i className="bi bi-chevron-right ms-sidebar-chevron" />
                      </Link>
                    ))}
                    <hr className="ms-sidebar-divider" />
                  </div>
                ))}
              </div>
            </div>

            {/* Cards grid */}
            <div className="col-12 col-lg-8">
              <div className="row g-3">
                {filtered.map((b) => (
                  <div className="col-12 col-md-6" key={b.slug}>
                    <Link to={`/brands/${b.slug}`} className="ms-brand-card d-block">
                      <div className="ms-brand-card-top">
                        <BrandLogo name={b.name} />
                        <div className="ms-brand-card-info">
                          <div className="ms-brand-card-name">{b.name}</div>
                          <div className="ms-brand-card-desc">{b.desc}</div>
                        </div>
                        <span className="ms-view-badge">
                          View <i className="bi bi-arrow-right" style={{ fontSize: 11 }} />
                        </span>
                      </div>
                      <div className="ms-brand-tags">
                        {(b.tags || ["Products", "Skincare"]).map((tag) => (
                          <span key={tag} className="ms-brand-tag">{tag}</span>
                        ))}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="ms-count-line">
                Showing <b>{filtered.length}</b> brand{filtered.length !== 1 ? "s" : ""}
                {activeLetter !== "#" ? ` for letter "${activeLetter}"` : ""}.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}