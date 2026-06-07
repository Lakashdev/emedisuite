/**
 * Reusable full-page / inline loader.
 * Usage:  <Loader />               — centred spinner
 *         <Loader size="sm" />     — smaller inline spinner
 *         <Loader fullPage />      — fills the viewport
 */
export default function Loader({ size = "md", fullPage = false }) {
  const spinnerClass = size === "sm" ? "spinner-border spinner-border-sm" : "spinner-border";

  if (fullPage) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
        role="status"
      >
        <span className={spinnerClass} style={{ color: "#1B3D6E" }}>
          <span className="visually-hidden">Loading…</span>
        </span>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center py-4" role="status">
      <span className={spinnerClass} style={{ color: "#1B3D6E" }}>
        <span className="visually-hidden">Loading…</span>
      </span>
    </div>
  );
}
