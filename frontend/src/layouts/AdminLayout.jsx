import { Outlet, Link } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="d-flex">
      <aside className="bg-dark text-white p-3" style={{ width: 240 }}>
        <h5>Admin</h5>
        <ul className="nav flex-column">
          <li className="nav-item"><Link to="/admin" className="nav-link text-white">Dashboard</Link></li>
          <li className="nav-item"><Link to="/admin/products" className="nav-link text-white">Products</Link></li>
          <li className="nav-item"><Link to="/admin/orders" className="nav-link text-white">Orders</Link></li>
          <li className="nav-item"><Link to="/admin/settings" className="nav-link text-white">Settings</Link></li>
        </ul>
      </aside>

      <main className="flex-fill p-4">
        <Outlet />
      </main>
    </div>
  );
}
