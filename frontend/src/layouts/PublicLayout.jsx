import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function PublicLayout() {
  return (
    <div className="app-shell d-flex flex-column">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
