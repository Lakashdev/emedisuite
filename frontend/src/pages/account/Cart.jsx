import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ─── helpers ─── */
function effectivePrice(item) {
  return item.variant ? item.variant.price : item.product.basePrice;
}

function lineTotal(item) {
  return effectivePrice(item) * item.quantity;
}

/* ─── Empty state ─── */
function EmptyCart() {
  return (
    <div style={{
      textAlign: "center", padding: "80px 24px",
      background: "#fff", borderRadius: 20,
      border: "1.5px solid #e2e8f0",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: "linear-gradient(135deg, #EEF2F8, #E8F5E2)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24,
      }}>
        <i className="bi bi-cart3" style={{ fontSize: 32, color: "#1B3D6E" }} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1B3D6E", marginBottom: 8 }}>
        Your cart is empty
      </h2>
      <p style={{ color: "#64748b", fontSize: 15, marginBottom: 28 }}>
        Looks like you haven't added anything yet.
      </p>
      <Link
        to="/products"
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#1B3D6E", color: "#fff", textDecoration: "none",
          padding: "12px 28px", borderRadius: 10, fontWeight: 700, fontSize: 14,
        }}
      >
        <i className="bi bi-bag" /> Browse Products
      </Link>
    </div>
  );
}

/* ─── Cart Item Row ─── */
function CartItemRow({ item, onQtyChange, onRemove, loading }) {
  const price = effectivePrice(item);
  const total = lineTotal(item);
  const maxStock = item.variant ? item.variant.stock : item.product.baseStock;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "56px 1fr auto auto",
      gap: 16, alignItems: "center",
      padding: "18px 0",
      borderBottom: "1px solid #f1f5f9",
      opacity: loading ? 0.5 : 1,
      transition: "opacity .2s",
    }}>
      {/* Image placeholder */}
      <div style={{
        width: 56, height: 56, borderRadius: 10,
        background: "linear-gradient(135deg, #EEF2F8, #E8F5E2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <i className="bi bi-box-seam" style={{ color: "#1B3D6E", fontSize: 20 }} />
      </div>

      {/* Product info */}
      <div style={{ minWidth: 0 }}>
        <Link
          to={`/products/${item.product.slug}`}
          style={{ fontWeight: 700, color: "#1B3D6E", fontSize: 14.5, textDecoration: "none", display: "block",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {item.product.name}
        </Link>
        {item.variant && (
          <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
            {item.variant.name}
          </div>
        )}
        <div style={{ fontSize: 13, color: "#1B3D6E", fontWeight: 700, marginTop: 4 }}>
          NPR {price.toLocaleString()}
        </div>
      </div>

      {/* Qty stepper */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1.5px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
        <button
          onClick={() => onQtyChange(item.id, item.quantity - 1)}
          disabled={loading || item.quantity <= 1}
          style={{
            width: 32, height: 32, border: "none", background: "transparent",
            cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
            color: item.quantity <= 1 ? "#cbd5e1" : "#1B3D6E",
            fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >−</button>
        <span style={{
          width: 32, textAlign: "center", fontSize: 13.5, fontWeight: 700, color: "#1B3D6E",
        }}>
          {item.quantity}
        </span>
        <button
          onClick={() => onQtyChange(item.id, item.quantity + 1)}
          disabled={loading || item.quantity >= maxStock}
          style={{
            width: 32, height: 32, border: "none", background: "transparent",
            cursor: item.quantity >= maxStock ? "not-allowed" : "pointer",
            color: item.quantity >= maxStock ? "#cbd5e1" : "#1B3D6E",
            fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >+</button>
      </div>

      {/* Total + remove */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#1B3D6E" }}>
          NPR {total.toLocaleString()}
        </div>
        <button
          onClick={() => onRemove(item.id)}
          disabled={loading}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#ef4444", fontSize: 12, fontWeight: 600,
            marginTop: 4, padding: 0, display: "flex", alignItems: "center", gap: 4,
            marginLeft: "auto",
          }}
        >
          <i className="bi bi-trash3" /> Remove
        </button>
      </div>
    </div>
  );
}

/* ─── Order Summary ─── */
function OrderSummary({ items, onCheckout }) {
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{
      background: "#fff", border: "1.5px solid #e2e8f0",
      borderRadius: 16, padding: "24px 22px", position: "sticky", top: 24,
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1B3D6E", marginBottom: 20 }}>
        Order Summary
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#475569" }}>
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span style={{ fontWeight: 600 }}>NPR {subtotal.toLocaleString()}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#475569" }}>
          <span>Delivery fee</span>
          <span style={{ color: "#6BBF4E", fontWeight: 600 }}>Calculated at checkout</span>
        </div>
      </div>

      <div style={{
        borderTop: "1.5px dashed #e2e8f0", paddingTop: 16, marginBottom: 20,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontWeight: 800, fontSize: 15, color: "#1B3D6E" }}>Total</span>
        <span style={{ fontWeight: 800, fontSize: 20, color: "#1B3D6E" }}>
          NPR {subtotal.toLocaleString()}
        </span>
      </div>

      <button
        onClick={onCheckout}
        style={{
          width: "100%", padding: "13px 0", borderRadius: 10,
          background: "#1B3D6E", color: "#fff", border: "none",
          fontWeight: 800, fontSize: 15, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "background .15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#162f55"}
        onMouseLeave={(e) => e.currentTarget.style.background = "#1B3D6E"}
      >
        <i className="bi bi-bag-check" /> Proceed to Checkout
      </button>

      <Link
        to="/products"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          marginTop: 12, color: "#64748b", textDecoration: "none", fontSize: 13.5,
          fontWeight: 600,
        }}
      >
        <i className="bi bi-arrow-left" /> Continue Shopping
      </Link>

      {/* Trust badges */}
      <div style={{
        marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {[
          { icon: "bi-shield-fill-check", text: "100% Genuine Products" },
          { icon: "bi-truck", text: "COD Available" },
          { icon: "bi-arrow-counterclockwise", text: "Easy Returns" },
        ].map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#64748b" }}>
            <i className={`bi ${b.icon}`} style={{ color: "#6BBF4E" }} />
            {b.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── MAIN CART PAGE ─── */
export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({}); // itemId → bool
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  /* ── Fetch cart ── */
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/cart`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load cart");
      const data = await res.json();
      setCart(data.cart);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  /* ── Update quantity ── */
  async function handleQtyChange(itemId, newQty) {
    if (newQty < 1) return;
    setActionLoading((prev) => ({ ...prev, [itemId]: true }));
    setWarning("");
    try {
      const res = await fetch(`${API_BASE}/cart/items/${itemId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity: newQty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      if (data.warning) setWarning(data.warning);
      await fetchCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  }

  /* ── Remove item ── */
  async function handleRemove(itemId) {
    setActionLoading((prev) => ({ ...prev, [itemId]: true }));
    try {
      const res = await fetch(`${API_BASE}/cart/items/${itemId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Remove failed");
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  }

  /* ── Checkout ── */
  function handleCheckout() {
    navigate("/checkout");
  }

  /* ── Styles ── */
  const items = cart?.items || [];

  return (
    <div style={{ background: "#f6f7fb", minHeight: "100vh" }}>
      <div className="container py-5" style={{ maxWidth: 1100 }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1B3D6E", margin: 0 }}>
            <i className="bi bi-cart3 me-2" />
            My Cart
          </h1>
          {!loading && items.length > 0 && (
            <p style={{ color: "#64748b", fontSize: 14, marginTop: 6 }}>
              {items.length} {items.length === 1 ? "product" : "products"} in your cart
            </p>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            padding: "10px 16px", borderRadius: 8, marginBottom: 16,
            background: "#FEF2F2", color: "#b91c1c", border: "1px solid #fecaca", fontSize: 13.5,
          }}>
            <i className="bi bi-exclamation-circle me-2" />{error}
          </div>
        )}
        {warning && (
          <div style={{
            padding: "10px 16px", borderRadius: 8, marginBottom: 16,
            background: "#FFFBEB", color: "#92400e", border: "1px solid #fde68a", fontSize: 13.5,
          }}>
            <i className="bi bi-info-circle me-2" />{warning}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{
            background: "#fff", borderRadius: 16, padding: "60px 24px",
            textAlign: "center", color: "#94a3b8",
          }}>
            <i className="bi bi-arrow-repeat me-2" style={{ animation: "spin 1s linear infinite" }} />
            Loading your cart…
          </div>
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

            {/* Items list */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "8px 24px" }}>
              {/* Table header */}
              <div style={{
                display: "grid", gridTemplateColumns: "56px 1fr auto auto",
                gap: 16, padding: "14px 0",
                borderBottom: "2px solid #f1f5f9",
                fontSize: 11, fontWeight: 800, letterSpacing: "0.07em",
                textTransform: "uppercase", color: "#94a3b8",
              }}>
                <div />
                <div>Product</div>
                <div style={{ textAlign: "center" }}>Qty</div>
                <div style={{ textAlign: "right" }}>Total</div>
              </div>

              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onQtyChange={handleQtyChange}
                  onRemove={handleRemove}
                  loading={!!actionLoading[item.id]}
                />
              ))}
            </div>

            {/* Order summary */}
            <OrderSummary items={items} onCheckout={handleCheckout} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}