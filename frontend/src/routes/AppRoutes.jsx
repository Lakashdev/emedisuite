import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AccountLayout from "../layouts/AccountLayout";
import AdminLayout from "../layouts/AdminLayout";

import Home from "../pages/public/Home";
import ProductList from "../pages/public/ProductList";
import ProductDetail from "../pages/public/ProductDetail";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import BrandList from "../pages/public/BrandList";
import BrandDetail from "../pages/public/BrandDetail";

import Register from "../pages/account/Register";
import Login from "../pages/account/Login";
import Cart from "../pages/account/Cart";
import Checkout from "../pages/account/Checkout";
import Orders from "../pages/account/Orders";

import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminRoute from "../components/common/AdminRoute";

export default function AppRoutes() {
  return (
    
      <Routes>

        {/* Public Website */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/brands" element={<BrandList />} />
          <Route path="/brands/:slug" element={<BrandDetail />} />
        </Route>

        {/* Customer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AccountLayout />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<div>Dashboard</div>} />
            <Route path="/admin/products" element={<div>Products</div>} />
            <Route path="/admin/orders" element={<div>Orders</div>} />
            <Route path="/admin/settings" element={<div>Settings</div>} />
          </Route>
        </Route>

      </Routes>
  );
}
