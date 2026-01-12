import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";

export default function AccountLayout() {
  return (
    <>
      <Navbar />
      <div className="container my-4">
        <Outlet />
      </div>
    </>
  );
}
