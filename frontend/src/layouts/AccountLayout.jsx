import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";

export default function AccountLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="account-shell">
        <div className="container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
