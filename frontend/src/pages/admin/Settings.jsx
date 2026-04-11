// pages/admin/Settings.jsx
// Route: /admin/settings  (index/landing page for all settings)

import { Link } from "react-router-dom";

const settingsSections = [
  {
    href: "/admin/settings/hero-slides",
    icon: "bi-images",
    color: "#6BBF4E",
    bg: "#F0FDF4",
    border: "#bbf7d0",
    title: "Hero Slides",
    desc: "Manage the homepage hero carousel — add, edit, reorder, or hide slides. Control headlines, buttons, featured products, colours, and offer pills.",
  },

  /* {
    href: "/admin/settings/store-info",
    icon: "bi-shop",
    color: "#1B3D6E",
    bg: "#EEF2F8",
    border: "#bfdbfe",
    title: "Store Info",
    desc: "Control footer content, About page, contact details, social links, opening hours, and newsletter settings.",
  }, */
  // ── Add more settings cards here in the future, e.g.:
  // {
  //   href: "/admin/settings/store",
  //   icon: "bi-shop",
  //   color: "#1B3D6E",
  //   bg: "#EEF2F8",
  //   border: "#bfdbfe",
  //   title: "Store Settings",
  //   desc: "Delivery fees, return window, cancellation policy.",
  // },
];

export default function Settings() {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1B3D6E", margin: 0 }}>Settings</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 6 }}>
          Configure your store's content, appearance, and behaviour.
        </p>
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {settingsSections.map((s) => (
          <Link
            key={s.href}
            to={s.href}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #e2e8f0",
                borderRadius: 14,
                padding: "24px 22px",
                transition: "box-shadow .18s, border-color .18s, transform .18s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(27,61,110,.10)";
                e.currentTarget.style.borderColor = s.border;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: s.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <i className={`bi ${s.icon}`} style={{ fontSize: 22, color: s.color }} />
              </div>

              {/* Text */}
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1B3D6E", marginBottom: 6 }}>
                {s.title}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                {s.desc}
              </div>

              {/* Arrow */}
              <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 4, color: s.color, fontSize: 13, fontWeight: 700 }}>
                Manage <i className="bi bi-arrow-right" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}