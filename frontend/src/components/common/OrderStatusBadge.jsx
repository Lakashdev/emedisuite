export default function OrderStatusBadge({ status }) {
  const s = String(status || "").toLowerCase();

  const cls =
    s === "delivered"
      ? "badge bg-success"
      : s === "cancelled"
      ? "badge bg-danger"
      : s === "outfordelivery"
      ? "badge bg-primary"
      : s === "packed"
      ? "badge bg-info text-dark"
      : s === "confirmed"
      ? "badge bg-warning text-dark"
      : "badge bg-secondary";

  return <span className={cls}>{status}</span>;
}
