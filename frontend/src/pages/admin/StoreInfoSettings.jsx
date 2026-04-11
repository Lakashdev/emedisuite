// pages/admin/StoreInfoSettings.jsx
// Route: /admin/settings/store-info

import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const s = {
  page: { padding: "32px 24px", maxWidth: 860, margin: "0 auto", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "28px 28px", marginBottom: 20 },
  sectionTitle: {
    fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
    textTransform: "uppercase", color: "#94a3b8", marginBottom: 16,
    paddingBottom: 10, borderBottom: "1px solid #f1f5f9",
  },
  label: { display: "block", fontSize: 12.5, fontWeight: 700, color: "#475569", marginBottom: 5 },
  input: {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1.5px solid #e2e8f0", fontSize: 13.5,
    boxSizing: "border-box", fontFamily: "inherit", outline: "none",
    transition: "border-color .15s",
  },
  textarea: {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1.5px solid #e2e8f0", fontSize: 13.5,
    boxSizing: "border-box", fontFamily: "inherit", outline: "none",
    resize: "vertical", minHeight: 90,
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 },
  field: { marginBottom: 14 },
  btn: {
    background: "#1B3D6E", color: "#fff", border: "none", borderRadius: 8,
    padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer",
  },
  btnOutline: {
    background: "transparent", border: "1.5px solid #e2e8f0", borderRadius: 8,
    padding: "9px 18px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", color: "#475569",
  },
  alert: (ok) => ({
    padding: "10px 16px", borderRadius: 8, marginBottom: 20, fontSize: 13.5,
    background: ok ? "#F0FDF4" : "#FEF2F2",
    color: ok ? "#15803d" : "#b91c1c",
    border: `1px solid ${ok ? "#bbf7d0" : "#fecaca"}`,
  }),
  toggle: (on) => ({
    display: "inline-flex", alignItems: "center", gap: 8,
    cursor: "pointer", fontSize: 13.5, fontWeight: 600,
    color: on ? "#15803d" : "#64748b",
  }),
};

export default function StoreInfoSettings() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/store-info`)
      .then((r) => r.json())
      .then((d) => setForm(d))
      .catch(() => setError("Failed to load store info"))
      .finally(() => setLoading(false));
  }, []);

  function f(key) {
    return {
      value: form?.[key] ?? "",
      onChange: (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
      onFocus: (e) => (e.target.style.borderColor = "#6BBF4E"),
      onBlur: (e) => (e.target.style.borderColor = "#e2e8f0"),
    };
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(""); setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/store-info/admin`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setForm(updated);
      setSuccess("Store info saved successfully!");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Loading store info…</div>
  );

  if (!form) return null;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1B3D6E", margin: 0 }}>Store Info</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 6 }}>
          Controls footer details, About page content, and contact information across the site.
        </p>
      </div>

      {error && <div style={s.alert(false)}>{error}</div>}
      {success && <div style={s.alert(true)}>✓ {success}</div>}

      <form onSubmit={handleSave}>

        {/* ── Basic Info ── */}
        <div style={s.card}>
          <div style={s.sectionTitle}>
            <i className="bi bi-shop me-2" />Store Identity
          </div>
          <div style={s.field}>
            <label style={s.label}>Store name</label>
            <input style={s.input} {...f("storeName")} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Tagline <span style={{ color: "#94a3b8", fontWeight: 400 }}>(shown in footer)</span></label>
            <input style={s.input} {...f("tagline")} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Short description <span style={{ color: "#94a3b8", fontWeight: 400 }}>(footer sub-text)</span></label>
            <textarea style={s.textarea} {...f("description")} />
          </div>
        </div>

        {/* ── Contact ── */}
        <div style={s.card}>
          <div style={s.sectionTitle}>
            <i className="bi bi-telephone me-2" />Contact Details
          </div>
          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Phone number</label>
              <input style={s.input} placeholder="+977 98XXXXXXXX" {...f("phone")} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <input style={s.input} type="email" placeholder="support@medisuite.com" {...f("email")} />
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Address</label>
            <input style={s.input} placeholder="Kathmandu, Nepal" {...f("address")} />
          </div>
          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Opening hours</label>
              <input style={s.input} placeholder="9:00 AM – 7:00 PM" {...f("openingHours")} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Open days</label>
              <input style={s.input} placeholder="Sunday – Friday" {...f("openDays")} />
            </div>
          </div>
        </div>

        {/* ── Social ── */}
        <div style={s.card}>
          <div style={s.sectionTitle}>
            <i className="bi bi-share me-2" />Social Media Links
          </div>
          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}><i className="bi bi-instagram me-1" /> Instagram URL</label>
              <input style={s.input} placeholder="https://instagram.com/..." {...f("instagramUrl")} />
            </div>
            <div style={s.field}>
              <label style={s.label}><i className="bi bi-facebook me-1" /> Facebook URL</label>
              <input style={s.input} placeholder="https://facebook.com/..." {...f("facebookUrl")} />
            </div>
            <div style={s.field}>
              <label style={s.label}><i className="bi bi-twitter-x me-1" /> Twitter / X URL</label>
              <input style={s.input} placeholder="https://x.com/..." {...f("twitterUrl")} />
            </div>
            <div style={s.field}>
              <label style={s.label}><i className="bi bi-tiktok me-1" /> TikTok URL</label>
              <input style={s.input} placeholder="https://tiktok.com/..." {...f("tiktokUrl")} />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={s.card}>
          <div style={s.sectionTitle}>
            <i className="bi bi-layout-text-sidebar me-2" />Footer Settings
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ ...s.toggle(form.newsletterEnabled), display: "flex", alignItems: "center", gap: 10 }}>
              <div
                onClick={() => setForm((p) => ({ ...p, newsletterEnabled: !p.newsletterEnabled }))}
                style={{
                  width: 42, height: 24, borderRadius: 999, cursor: "pointer",
                  background: form.newsletterEnabled ? "#6BBF4E" : "#cbd5e1",
                  position: "relative", transition: "background .2s", flexShrink: 0,
                }}
              >
                <div style={{
                  position: "absolute", top: 3, left: form.newsletterEnabled ? 21 : 3,
                  width: 18, height: 18, borderRadius: "50%", background: "#fff",
                  transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                }} />
              </div>
              Newsletter signup visible in footer
            </label>
          </div>
          {form.newsletterEnabled && (
            <div style={s.field}>
              <label style={s.label}>Newsletter section heading</label>
              <input style={s.input} placeholder="Get offers + skincare tips" {...f("newsletterText")} />
            </div>
          )}
          <div style={s.grid3}>
            <div style={s.field}>
              <label style={s.label}>Terms URL</label>
              <input style={s.input} placeholder="/pages/terms" {...f("termsUrl")} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Privacy URL</label>
              <input style={s.input} placeholder="/pages/privacy" {...f("privacyUrl")} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Refund policy URL</label>
              <input style={s.input} placeholder="/pages/refund" {...f("refundUrl")} />
            </div>
          </div>
        </div>

        {/* ── About page ── */}
        <div style={s.card}>
          <div style={s.sectionTitle}>
            <i className="bi bi-file-earmark-person me-2" />About Page Content
          </div>
          <div style={s.field}>
            <label style={s.label}>Page headline</label>
            <input style={s.input} placeholder="About Us" {...f("aboutHeadline")} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Sub-headline</label>
            <input style={s.input} placeholder="We are a modern pharmacy..." {...f("aboutSubheadline")} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Body text</label>
            <textarea style={{ ...s.textarea, minHeight: 120 }} {...f("aboutBody")} />
          </div>
          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Mission statement</label>
              <textarea style={s.textarea} {...f("aboutMission")} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Vision statement</label>
              <textarea style={s.textarea} {...f("aboutVision")} />
            </div>
          </div>

          {/* Stats */}
          <div style={{ ...s.sectionTitle, marginTop: 20 }}>Highlight Stats</div>
          <div style={s.grid3}>
            <div>
              <div style={s.field}>
                <label style={s.label}>Stat 1 value</label>
                <input style={s.input} placeholder="100%" {...f("stat1Val")} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Stat 1 label</label>
                <input style={s.input} placeholder="Genuine Products" {...f("stat1Label")} />
              </div>
            </div>
            <div>
              <div style={s.field}>
                <label style={s.label}>Stat 2 value</label>
                <input style={s.input} placeholder="2000+" {...f("stat2Val")} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Stat 2 label</label>
                <input style={s.input} placeholder="Happy Customers" {...f("stat2Label")} />
              </div>
            </div>
            <div>
              <div style={s.field}>
                <label style={s.label}>Stat 3 value</label>
                <input style={s.input} placeholder="Same Day" {...f("stat3Val")} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Stat 3 label</label>
                <input style={s.input} placeholder="Delivery" {...f("stat3Label")} />
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingBottom: 40 }}>
          <button type="button" style={s.btnOutline} onClick={() => window.location.reload()}>
            Discard changes
          </button>
          <button type="submit" style={s.btn} disabled={saving}>
            {saving ? "Saving…" : "Save all changes"}
          </button>
        </div>

      </form>
    </div>
  );
}