import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import OrderStatusBadge from "../../components/common/OrderStatusBadge";

const API = "http://localhost:5000";
const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-US")}`;
const fmt = (d) => (d ? new Date(d).toLocaleString() : "-");

export default function OrderDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const nav = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const authHeader = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    let ignore = false;

    async function load() {
      setErr("");
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/orders/${id}`, { headers: authHeader });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load order");

        if (!ignore) setOrder(data.order);
      } catch (e) {
        if (!ignore) setErr(e.message || "Error");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => (ignore = true);
  }, [id, token]);

  const reorder = async () => {
    setErr("");
    try {
      const res = await fetch(`${API}/api/cart/reorder/${id}`, { method: "POST", headers: authHeader });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reorder failed");
      nav("/cart");
    } catch (e) {
      setErr(e.message || "Reorder failed");
    }
  };

  const cancelOrder = async () => {
    setErr("");
    const reason = prompt("Cancel reason (optional):") || "";
    try {
      // depends how you mount orderActionsRoutes
      const res = await fetch(`${API}/api/orders/${id}/cancel`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancel failed");
      setOrder(data.order);
    } catch (e) {
      setErr(e.message || "Cancel failed");
    }
  };

  if (loading) return <div className="container py-5">Loading order…</div>;

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <div className="d-flex justify-content-between align-items-end mb-3">
        <div>
          <div className="text-secondary small">
            <Link to="/orders">← Back to orders</Link>
          </div>
          <h2 className="fw-bold mb-1">Order #{order?.orderNumber}</h2>
          <div className="text-secondary">
            Placed: {fmt(order?.placedAt)} • <OrderStatusBadge status={order?.status} />
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={reorder}>
            Reorder
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={cancelOrder}
            disabled={!["Placed", "Confirmed"].includes(order?.status)}
            title={!["Placed", "Confirmed"].includes(order?.status) ? "Cannot cancel at this stage" : ""}
          >
            Cancel
          </button>
        </div>
      </div>

      {err ? <div className="alert alert-danger">{err}</div> : null}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3"><div className="card card-soft p-3"><div className="text-secondary small">Subtotal</div><div className="fw-bold">{money(order?.subtotal)}</div></div></div>
        <div className="col-12 col-md-3"><div className="card card-soft p-3"><div className="text-secondary small">Discount</div><div className="fw-bold">{money(order?.discountTotal)}</div></div></div>
        <div className="col-12 col-md-3"><div className="card card-soft p-3"><div className="text-secondary small">Delivery Fee</div><div className="fw-bold">{money(order?.deliveryFee)}</div></div></div>
        <div className="col-12 col-md-3"><div className="card card-soft p-3"><div className="text-secondary small">Total</div><div className="fw-bold">{money(order?.total)}</div></div></div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card card-soft p-4">
            <h5 className="fw-bold mb-3">Items</h5>

            {order?.items?.map((it) => (
              <div key={it.id} className="d-flex justify-content-between align-items-start border rounded-4 p-3 mb-3">
                <div>
                  <div className="fw-semibold">{it.productName}</div>
                  <div className="text-secondary small">
                    {it.variantName ? `${it.variantName} • ` : ""}Qty: {it.quantity}
                  </div>
                </div>
                <div className="text-end">
                  <div className="fw-semibold">{money(it.lineTotal)}</div>
                  <div className="text-secondary small">{money(it.unitPrice)} each</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card card-soft p-4">
            <h5 className="fw-bold mb-3">Delivery</h5>
            <div className="mb-2"><span className="text-secondary">Name:</span> {order?.fullName}</div>
            <div className="mb-2"><span className="text-secondary">Phone:</span> {order?.phone}</div>
            <div className="mb-2"><span className="text-secondary">Address:</span> {order?.addressLine}</div>
            <div className="mb-2"><span className="text-secondary">Area:</span> {order?.area || "-"}</div>
            <div className="mb-2"><span className="text-secondary">Landmark:</span> {order?.landmark || "-"}</div>
            <div className="mb-2"><span className="text-secondary">City:</span> {order?.city}</div>
            <div className="mb-2"><span className="text-secondary">Zone:</span> {order?.deliveryZone}</div>
            <div className="mb-2"><span className="text-secondary">Payment:</span> {order?.paymentMethod}</div>
            {order?.notes ? (
              <div className="mt-3 p-3 rounded-4" style={{ background: "rgba(15,23,42,.05)" }}>
                <div className="text-secondary small mb-1">Notes</div>
                <div>{order.notes}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
