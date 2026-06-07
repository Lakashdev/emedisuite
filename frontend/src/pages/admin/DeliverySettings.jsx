import { useEffect, useState } from "react";
import api from "../../api/axios.js";

const EMPTY_ZONE = { city: "", district: "", areaType: "outside_valley", tier: "hub", isActive: true, sortOrder: 0 };
const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13.5, boxSizing: "border-box", fontFamily: "inherit" };
const labelStyle = { display: "block", fontSize: 12.5, fontWeight: 700, color: "#475569", marginBottom: 5 };
const buttonStyle = { border: "none", borderRadius: 8, padding: "9px 16px", background: "#1B3D6E", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" };

export default function DeliverySettings() {
  const [settings, setSettings] = useState(null);
  const [zones, setZones] = useState([]);
  const [zoneForm, setZoneForm] = useState(EMPTY_ZONE);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadConfig() {
    setLoading(true);
    try {
      const { data } = await api.get("/delivery/admin");
      setSettings(data.settings);
      setZones(data.zones || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadConfig(); }, []);

  function notify(text) {
    setMessage(text);
    setError("");
  }

  async function saveSettings(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/delivery/admin/settings", settings);
      setSettings(data.settings);
      notify("Delivery pricing updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function changeAreaType(areaType) {
    setZoneForm((current) => ({ ...current, areaType, tier: areaType === "inside_valley" ? "valley" : current.tier === "valley" ? "hub" : current.tier }));
  }

  async function saveZone(event) {
    event.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/delivery/admin/zones/${editId}`, zoneForm);
        notify("Delivery city updated.");
      } else {
        await api.post("/delivery/admin/zones", zoneForm);
        notify("Delivery city added.");
      }
      setEditId(null);
      setZoneForm(EMPTY_ZONE);
      await loadConfig();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function editZone(zone) {
    setEditId(zone.id);
    setZoneForm({ city: zone.city, district: zone.district || "", areaType: zone.areaType, tier: zone.tier, isActive: zone.isActive, sortOrder: zone.sortOrder });
  }

  async function disableZone(id) {
    if (!window.confirm("Disable this delivery city? Existing orders will remain unchanged.")) return;
    try {
      await api.delete(`/delivery/admin/zones/${id}`);
      notify("Delivery city disabled.");
      await loadConfig();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading && !settings) return <div style={{ color: "#64748b" }}>Loading delivery settings...</div>;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1B3D6E", marginBottom: 6 }}>Delivery Settings</h1>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 22 }}>Configure checkout fees and supported delivery cities.</p>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {message && <div className="alert alert-success py-2">{message}</div>}

      <form onSubmit={saveSettings} style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 22 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1B3D6E", marginBottom: 16 }}>Pricing</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            ["freeDeliveryThreshold", "Valley free-delivery threshold"],
            ["deliveryFeeInside", "Valley fee below threshold"],
            ["deliveryFeeHub", "Outside Valley hub fee"],
            ["deliveryFeeOtherCity", "Other outside city fee"],
          ].map(([key, label]) => (
            <div key={key}>
              <label style={labelStyle}>{label} (NPR)</label>
              <input style={inputStyle} type="number" min="0" value={settings?.[key] ?? ""} onChange={(e) => setSettings((current) => ({ ...current, [key]: e.target.value }))} required />
            </div>
          ))}
        </div>
        <button type="submit" style={{ ...buttonStyle, marginTop: 16 }} disabled={saving}>Save Pricing</button>
      </form>

      <form onSubmit={saveZone} style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 22 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1B3D6E", marginBottom: 16 }}>{editId ? "Edit Delivery City" : "Add Delivery City"}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 1fr 100px", gap: 12 }}>
          <input style={inputStyle} placeholder="City" value={zoneForm.city} onChange={(e) => setZoneForm({ ...zoneForm, city: e.target.value })} required />
          <input style={inputStyle} placeholder="District" value={zoneForm.district} onChange={(e) => setZoneForm({ ...zoneForm, district: e.target.value })} />
          <select style={inputStyle} value={zoneForm.areaType} onChange={(e) => changeAreaType(e.target.value)}>
            <option value="inside_valley">Inside Kathmandu Valley</option><option value="outside_valley">Outside Kathmandu Valley</option>
          </select>
          <select style={inputStyle} value={zoneForm.tier} onChange={(e) => setZoneForm({ ...zoneForm, tier: e.target.value })} disabled={zoneForm.areaType === "inside_valley"}>
            {zoneForm.areaType === "inside_valley" ? <option value="valley">Valley</option> : <><option value="hub">Major Hub</option><option value="other_city">Other Major City</option></>}
          </select>
          <input style={inputStyle} type="number" min="0" placeholder="Order" value={zoneForm.sortOrder} onChange={(e) => setZoneForm({ ...zoneForm, sortOrder: e.target.value })} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button type="submit" style={buttonStyle} disabled={saving}>{editId ? "Save City" : "Add City"}</button>
          {editId && <button type="button" className="btn btn-light btn-sm" onClick={() => { setEditId(null); setZoneForm(EMPTY_ZONE); }}>Cancel</button>}
        </div>
      </form>

      <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1B3D6E", marginBottom: 14 }}>Supported Locations</h2>
        <div className="table-responsive"><table className="table align-middle">
          <thead><tr><th>City</th><th>District</th><th>Area</th><th>Tier</th><th>Status</th><th /></tr></thead>
          <tbody>{zones.map((zone) => <tr key={zone.id}>
            <td>{zone.city}</td><td>{zone.district || "-"}</td><td>{zone.areaType === "inside_valley" ? "Inside Valley" : "Outside Valley"}</td>
            <td>{zone.tier === "valley" ? "Valley" : zone.tier === "hub" ? "Major Hub" : "Other City"}</td><td>{zone.isActive ? "Active" : "Disabled"}</td>
            <td style={{ textAlign: "right" }}><button className="btn btn-outline-primary btn-sm me-2" onClick={() => editZone(zone)}>Edit</button>{zone.isActive && <button className="btn btn-outline-danger btn-sm" onClick={() => disableZone(zone.id)}>Disable</button>}</td>
          </tr>)}</tbody>
        </table></div>
      </div>
    </div>
  );
}
