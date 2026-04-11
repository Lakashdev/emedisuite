import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const money = (n) => `NPR ${Number(n || 0).toLocaleString("en-US")}`;

/* ─── Step indicator ─── */
function Steps({ step }) {
  const steps = ["Select Items", "Delivery Details", "Confirm Order"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
      {steps.map((label, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "#6BBF4E" : active ? "#1B3D6E" : "#e2e8f0",
                color: done || active ? "#fff" : "#94a3b8",
                fontWeight: 800, fontSize: 14, transition: "all .2s",
              }}>
                {done ? <i className="bi bi-check2" /> : num}
              </div>
              <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? "#1B3D6E" : done ? "#6BBF4E" : "#94a3b8" }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? "#6BBF4E" : "#e2e8f0", margin: "0 12px", transition: "background .3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Price summary sidebar ─── */
function PriceSummary({ items, deliveryFee, deliveryZone, loading }) {
  const subtotal = items.reduce((sum, it) => {
    const price = it.variant ? it.variant.price : it.product.basePrice;
    return sum + price * it.quantity;
  }, 0);
  const total = subtotal + (deliveryZone ? deliveryFee : 0);

  return (
    <div style={{
      background: "#fff", border: "1.5px solid #e2e8f0",
      borderRadius: 16, padding: "24px", position: "sticky", top: 24,
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1B3D6E", marginBottom: 20 }}>Order Summary</h3>

      <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 16 }}>
        {items.map((it) => {
          const price = it.variant ? it.variant.price : it.product.basePrice;
          return (
            <div key={it.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13.5 }}>
              <div style={{ color: "#475569", flex: 1, marginRight: 8 }}>
                <span style={{ fontWeight: 600, color: "#1e293b" }}>{it.product.name}</span>
                {it.variant && <span style={{ color: "#94a3b8" }}> · {it.variant.name}</span>}
                <span style={{ color: "#94a3b8" }}> ×{it.quantity}</span>
              </div>
              <div style={{ fontWeight: 700, color: "#1B3D6E", flexShrink: 0 }}>{money(price * it.quantity)}</div>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "#64748b" }}>
          <span>Subtotal</span>
          <span style={{ fontWeight: 600 }}>{money(subtotal)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "#64748b" }}>
          <span>Delivery fee</span>
          {loading ? (
            <span style={{ color: "#94a3b8" }}>calculating…</span>
          ) : !deliveryZone ? (
            <span style={{ color: "#94a3b8" }}>select zone</span>
          ) : (
            <span style={{ fontWeight: 600, color: deliveryFee === 0 ? "#6BBF4E" : "#1e293b" }}>
              {deliveryFee === 0 ? "Free" : money(deliveryFee)}
            </span>
          )}
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          borderTop: "2px solid #e2e8f0", paddingTop: 12, marginTop: 4,
        }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#1B3D6E" }}>Total</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#1B3D6E" }}>{money(total)}</span>
        </div>
      </div>

      <div style={{ marginTop: 16, padding: "10px 14px", background: "#F0FDF4", borderRadius: 8, fontSize: 12, color: "#15803d" }}>
        <i className="bi bi-shield-fill-check me-2" />Payment on delivery (COD)
      </div>
    </div>
  );
}

/* ─── STEP 1: Item selection ─── */
function StepSelectItems({ cartItems, selected, onToggle, onToggleAll, onNext }) {
  const allSelected = cartItems.length > 0 && selected.size === cartItems.length;

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1B3D6E", marginBottom: 4 }}>Select Items to Checkout</h2>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>Choose which cart items you want to include in this order.</p>

      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
        {/* Select all header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 20px", background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0", cursor: "pointer",
        }} onClick={onToggleAll}>
          <div style={{
            width: 20, height: 20, borderRadius: 5,
            border: `2px solid ${allSelected ? "#1B3D6E" : "#cbd5e1"}`,
            background: allSelected ? "#1B3D6E" : "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {allSelected && <i className="bi bi-check2" style={{ color: "#fff", fontSize: 12 }} />}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
            Select all ({cartItems.length} items)
          </span>
        </div>

        {/* Items */}
        {cartItems.map((item) => {
          const price = item.variant ? item.variant.price : item.product.basePrice;
          const isChecked = selected.has(item.id);
          const img = item.product.images?.[0]?.url;

          return (
            <div
              key={item.id}
              onClick={() => onToggle(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
                cursor: "pointer",
                background: isChecked ? "#f0f6ff" : "#fff",
                transition: "background .15s",
              }}
            >
              {/* Checkbox */}
              <div style={{
                width: 20, height: 20, borderRadius: 5,
                border: `2px solid ${isChecked ? "#1B3D6E" : "#cbd5e1"}`,
                background: isChecked ? "#1B3D6E" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {isChecked && <i className="bi bi-check2" style={{ color: "#fff", fontSize: 12 }} />}
              </div>

              {/* Image */}
              <div style={{
                width: 52, height: 52, borderRadius: 8, flexShrink: 0,
                background: "linear-gradient(135deg,#EEF2F8,#E8F5E2)",
                overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {img
                  ? <img src={img} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <i className="bi bi-box-seam" style={{ color: "#1B3D6E", fontSize: 20 }} />
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.product.name}
                </div>
                {item.variant && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{item.variant.name}</div>}
                <div style={{ fontSize: 13, color: "#1B3D6E", fontWeight: 700, marginTop: 4 }}>
                  {money(price)} × {item.quantity}
                </div>
              </div>

              {/* Line total */}
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1B3D6E", flexShrink: 0 }}>
                {money(price * item.quantity)}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onNext}
          disabled={selected.size === 0}
          style={{
            padding: "12px 28px", borderRadius: 10,
            background: selected.size === 0 ? "#e2e8f0" : "#1B3D6E",
            color: selected.size === 0 ? "#94a3b8" : "#fff",
            border: "none", fontWeight: 800, fontSize: 14, cursor: selected.size === 0 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          Continue to Delivery <i className="bi bi-arrow-right" />
        </button>
      </div>
    </div>
  );
}

/* ─── STEP 2: Delivery form ─── */
const ZONE_OPTIONS = [
  { value: "inside", label: "Inside Ring Road", sub: "Thamel, Baluwatar, Lazimpat, Naxal, New Baneshwor, etc." },
  { value: "outside", label: "Outside Ring Road", sub: "Bhaktapur, Lalitpur, Budhanilkantha, Tokha, Jorpati, etc." },
];

function StepDelivery({ form, onChange, deliveryFee, settingsLoading, onBack, onNext }) {
  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 9, fontSize: 14,
    border: "1.5px solid #e2e8f0", outline: "none", background: "#fff",
    fontFamily: "inherit", boxSizing: "border-box", color: "#1e293b",
  };
  const labelStyle = { fontSize: 12.5, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" };

  const valid = form.fullName && form.phone && form.addressLine && form.deliveryZone;

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1B3D6E", marginBottom: 4 }}>Delivery Details</h2>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Where should we deliver your order?</p>

      {/* Zone picker */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Delivery Zone <span style={{ color: "#ef4444" }}>*</span></label>
        <div style={{ display: "flex", gap: 12 }}>
          {ZONE_OPTIONS.map((z) => {
            const active = form.deliveryZone === z.value;
            return (
              <div
                key={z.value}
                onClick={() => onChange("deliveryZone", z.value)}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                  border: `2px solid ${active ? "#1B3D6E" : "#e2e8f0"}`,
                  background: active ? "#EEF2F8" : "#fff",
                  transition: "all .15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: `2px solid ${active ? "#1B3D6E" : "#cbd5e1"}`,
                    background: active ? "#1B3D6E" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: active ? "#1B3D6E" : "#475569" }}>{z.label}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "#94a3b8", marginLeft: 26 }}>{z.sub}</div>
                {!settingsLoading && form.deliveryZone === z.value && (
                  <div style={{ marginTop: 8, marginLeft: 26, fontSize: 12.5, fontWeight: 700, color: "#1B3D6E" }}>
                    <i className="bi bi-truck me-1" />Delivery: {deliveryFee === 0 ? "Free" : money(deliveryFee)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Name & phone */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Full Name <span style={{ color: "#ef4444" }}>*</span></label>
          <input
            style={inputStyle}
            value={form.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label style={labelStyle}>Phone <span style={{ color: "#ef4444" }}>*</span></label>
          <input
            style={inputStyle}
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="98XXXXXXXX"
          />
        </div>
      </div>

      {/* Address */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Address Line <span style={{ color: "#ef4444" }}>*</span></label>
        <input
          style={inputStyle}
          value={form.addressLine}
          onChange={(e) => onChange("addressLine", e.target.value)}
          placeholder="Street / building number"
        />
      </div>

      {/* Area & Landmark */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Area / Locality</label>
          <input
            style={inputStyle}
            value={form.area}
            onChange={(e) => onChange("area", e.target.value)}
            placeholder="e.g. Thamel"
          />
        </div>
        <div>
          <label style={labelStyle}>Landmark</label>
          <input
            style={inputStyle}
            value={form.landmark}
            onChange={(e) => onChange("landmark", e.target.value)}
            placeholder="Near landmark"
          />
        </div>
      </div>

      {/* City & Notes */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>City</label>
        <input
          style={{ ...inputStyle, background: "#f8fafc", color: "#94a3b8" }}
          value="Kathmandu"
          readOnly
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Order Notes (optional)</label>
        <textarea
          style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
          value={form.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Any special instructions for delivery…"
        />
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
        <button
          onClick={onBack}
          style={{
            padding: "12px 22px", borderRadius: 10, border: "1.5px solid #e2e8f0",
            background: "#fff", color: "#475569", fontWeight: 700, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <i className="bi bi-arrow-left" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!valid}
          style={{
            padding: "12px 28px", borderRadius: 10,
            background: valid ? "#1B3D6E" : "#e2e8f0",
            color: valid ? "#fff" : "#94a3b8",
            border: "none", fontWeight: 800, fontSize: 14, cursor: valid ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          Review Order <i className="bi bi-arrow-right" />
        </button>
      </div>
    </div>
  );
}

/* ─── STEP 3: Confirm ─── */
function StepConfirm({ form, selectedItems, deliveryFee, submitting, onBack, onConfirm }) {
  const subtotal = selectedItems.reduce((sum, it) => {
    const price = it.variant ? it.variant.price : it.product.basePrice;
    return sum + price * it.quantity;
  }, 0);
  const total = subtotal + deliveryFee;

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1B3D6E", marginBottom: 4 }}>Review & Confirm</h2>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Please review your order before placing it.</p>

      {/* Items */}
      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "20px", marginBottom: 16 }}>
        <div style={{ fontWeight: 800, color: "#1B3D6E", marginBottom: 14, fontSize: 14 }}>
          Items ({selectedItems.length})
        </div>
        {selectedItems.map((it) => {
          const price = it.variant ? it.variant.price : it.product.basePrice;
          return (
            <div key={it.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13.5 }}>
              <div>
                <span style={{ fontWeight: 600 }}>{it.product.name}</span>
                {it.variant && <span style={{ color: "#94a3b8" }}> · {it.variant.name}</span>}
                <span style={{ color: "#94a3b8" }}> ×{it.quantity}</span>
              </div>
              <div style={{ fontWeight: 700, color: "#1B3D6E" }}>{money(price * it.quantity)}</div>
            </div>
          );
        })}
        <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: 12, marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", marginBottom: 6 }}>
            <span>Subtotal</span><span>{money(subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", marginBottom: 6 }}>
            <span>Delivery</span><span>{deliveryFee === 0 ? "Free" : money(deliveryFee)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 15, color: "#1B3D6E" }}>
            <span>Total</span><span>{money(total)}</span>
          </div>
        </div>
      </div>

      {/* Address summary */}
      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "20px", marginBottom: 24 }}>
        <div style={{ fontWeight: 800, color: "#1B3D6E", marginBottom: 12, fontSize: 14 }}>Delivery Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 13.5, color: "#475569" }}>
          {[
            ["Name", form.fullName],
            ["Phone", form.phone],
            ["Address", form.addressLine],
            ["Area", form.area || "-"],
            ["Landmark", form.landmark || "-"],
            ["City", "Kathmandu"],
            ["Zone", form.deliveryZone === "inside" ? "Inside Ring Road" : "Outside Ring Road"],
            ["Payment", "Cash on Delivery"],
          ].map(([k, v]) => (
            <div key={k}>
              <span style={{ color: "#94a3b8", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>{k}</span>
              <div style={{ fontWeight: 600, color: "#1e293b" }}>{v}</div>
            </div>
          ))}
        </div>
        {form.notes && (
          <div style={{ marginTop: 12, padding: "10px 12px", background: "#f8fafc", borderRadius: 8, fontSize: 13 }}>
            <span style={{ color: "#94a3b8", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase" }}>Notes</span>
            <div style={{ color: "#475569", marginTop: 2 }}>{form.notes}</div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
        <button
          onClick={onBack}
          disabled={submitting}
          style={{
            padding: "12px 22px", borderRadius: 10, border: "1.5px solid #e2e8f0",
            background: "#fff", color: "#475569", fontWeight: 700, fontSize: 14,
            cursor: submitting ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <i className="bi bi-arrow-left" /> Back
        </button>
        <button
          onClick={onConfirm}
          disabled={submitting}
          style={{
            padding: "12px 32px", borderRadius: 10,
            background: submitting ? "#94a3b8" : "#6BBF4E",
            color: "#fff", border: "none", fontWeight: 800, fontSize: 15,
            cursor: submitting ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 10,
          }}
        >
          {submitting
            ? <><i className="bi bi-arrow-repeat" style={{ animation: "spin 1s linear infinite" }} /> Placing order…</>
            : <><i className="bi bi-bag-check-fill" /> Place Order</>
          }
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN CHECKOUT PAGE ─── */
export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  // Step 1: selected item IDs
  const [selected, setSelected] = useState(new Set());

  // Step 2: delivery form
  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: "",
    addressLine: "",
    area: "",
    landmark: "",
    notes: "",
    deliveryZone: "",
  });

  // Settings (delivery fees)
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Session
  const [sessionId, setSessionId] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* ── Load cart ── */
  useEffect(() => {
    if (!user) { navigate("/login"); return; }

    async function loadCart() {
      setCartLoading(true);
      try {
        const res = await fetch(`${API}/cart`, { headers: getHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load cart");
        const items = data.cart?.items || [];
        setCartItems(items);
        // Pre-select all items
        setSelected(new Set(items.map((it) => it.id)));
      } catch (e) {
        setError(e.message);
      } finally {
        setCartLoading(false);
      }
    }

    loadCart();
  }, [user, navigate]);

  /* ── Load delivery settings ── */
  useEffect(() => {
    async function loadSettings() {
      setSettingsLoading(true);
      try {
        const res = await fetch(`${API}/settings/store`);
        const data = await res.json();
        setSettings(data.settings);
      } catch {
        // silently fail — user will see "select zone" until fee shows
      } finally {
        setSettingsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const deliveryFee = settings && form.deliveryZone
    ? (form.deliveryZone === "inside" ? settings.deliveryFeeInside : settings.deliveryFeeOutside)
    : 0;

  const selectedItems = cartItems.filter((it) => selected.has(it.id));

  /* ── Handlers ── */
  function toggleItem(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === cartItems.length) setSelected(new Set());
    else setSelected(new Set(cartItems.map((it) => it.id)));
  }

  function handleFormChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  /* ── Step 1 → 2: create checkout session ── */
  async function handleStep1Next() {
    setError("");
    setSessionLoading(true);
    try {
      const body = {
        cartItemIds: [...selected],
        deliveryZone: form.deliveryZone || undefined,
      };
      const res = await fetch(`${API}/checkout-sessions`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create checkout session");
      setSessionId(data.sessionId);
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setSessionLoading(false);
    }
  }

  /* ── Step 3: confirm order ── */
  async function handleConfirm() {
    if (!sessionId) return;
    setError("");
    setSubmitting(true);
    try {
      const body = {
        fullName: form.fullName,
        phone: form.phone,
        addressLine: form.addressLine,
        area: form.area || undefined,
        landmark: form.landmark || undefined,
        city: "Kathmandu",
        deliveryZone: form.deliveryZone,
        notes: form.notes || undefined,
      };
      const res = await fetch(`${API}/checkout-sessions/${sessionId}/confirm`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to place order");
      navigate(`/orders/${data.order.id}`, { state: { justPlaced: true } });
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  /* ── Render ── */
  if (!user) return null;

  if (cartLoading) {
    return (
      <div style={{ background: "#f6f7fb", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 15 }}>
          <i className="bi bi-arrow-repeat" style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
          Loading your cart…
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ background: "#f6f7fb", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <i className="bi bi-cart-x" style={{ fontSize: 48, color: "#cbd5e1", marginBottom: 16, display: "block" }} />
          <div style={{ fontWeight: 700, color: "#475569", marginBottom: 8 }}>Your cart is empty</div>
          <Link to="/products" style={{ color: "#1B3D6E", fontWeight: 600 }}>Browse products</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f6f7fb", minHeight: "100vh" }}>
      <div className="container py-5" style={{ maxWidth: 1060 }}>
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <Link to="/cart" style={{ color: "#64748b", fontSize: 13.5, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <i className="bi bi-arrow-left" /> Back to cart
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1B3D6E", marginTop: 8, marginBottom: 0 }}>
            <i className="bi bi-bag-check me-2" />Checkout
          </h1>
        </div>

        {/* Step indicator */}
        <Steps step={step} />

        {error && (
          <div style={{
            padding: "12px 16px", borderRadius: 8, marginBottom: 20,
            background: "#FEF2F2", color: "#b91c1c", border: "1px solid #fecaca", fontSize: 13.5,
          }}>
            <i className="bi bi-exclamation-circle me-2" />{error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
          {/* Main content */}
          <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "28px 28px" }}>
            {step === 1 && (
              <StepSelectItems
                cartItems={cartItems}
                selected={selected}
                onToggle={toggleItem}
                onToggleAll={toggleAll}
                onNext={handleStep1Next}
              />
            )}
            {step === 2 && (
              <StepDelivery
                form={form}
                onChange={handleFormChange}
                deliveryFee={deliveryFee}
                settingsLoading={settingsLoading}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <StepConfirm
                form={form}
                selectedItems={selectedItems}
                deliveryFee={deliveryFee}
                submitting={submitting}
                onBack={() => setStep(2)}
                onConfirm={handleConfirm}
              />
            )}
          </div>

          {/* Sidebar */}
          <PriceSummary
            items={selectedItems}
            deliveryFee={deliveryFee}
            deliveryZone={form.deliveryZone}
            loading={settingsLoading}
          />
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}