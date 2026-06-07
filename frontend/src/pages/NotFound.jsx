import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-5 text-center" style={{ minHeight: "60vh" }}>
      <div style={{ fontSize: "6rem", lineHeight: 1 }}>404</div>
      <h2 className="fw-bold mt-2" style={{ color: "#1B3D6E" }}>Page Not Found</h2>
      <p className="text-muted mb-4">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="d-flex gap-2 justify-content-center">
        <Link to="/" className="btn btn-primary px-4">
          <i className="bi bi-house me-2" />
          Go Home
        </Link>
        <Link to="/products" className="btn btn-outline-secondary px-4">
          Browse Products
        </Link>
      </div>
    </div>
  );
}
