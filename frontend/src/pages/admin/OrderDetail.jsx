import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios.js";
import Loader from "../../components/common/Loader.jsx";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/admin/orders/${id}`)
      .then(res => setOrder(res.data.order || res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullPage />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!order) return null;

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/admin/orders" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left me-1" />Back
        </Link>
        <h5 className="mb-0 fw-bold">Order #{order.orderNumber}</h5>
      </div>

      <div className="row g-3">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">Items</h6>
              {order.items?.map(item => (
                <div key={item.id} className="d-flex justify-content-between py-2 border-bottom">
                  <div>
                    <div>{item.productName}</div>
                    {item.variantName && <small className="text-muted">{item.variantName}</small>}
                    <div className="text-muted small">×{item.quantity}</div>
                  </div>
                  <div className="text-end">
                    <div>NPR {item.lineTotal?.toLocaleString()}</div>
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-between mt-3 fw-bold">
                <span>Total</span>
                <span>NPR {order.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">Delivery</h6>
              <p className="mb-1">{order.fullName}</p>
              <p className="mb-1 text-muted">{order.phone}</p>
              <p className="mb-0 text-muted">{order.addressLine}{order.area ? `, ${order.area}` : ""}</p>
            </div>
          </div>
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-semibold mb-2">Status</h6>
              <span className="badge bg-primary fs-6">{order.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
