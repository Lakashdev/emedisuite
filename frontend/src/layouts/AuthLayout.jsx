import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function AuthLayout() {
  return (
    <>
      <Navbar />
      <main className="pt-3">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
