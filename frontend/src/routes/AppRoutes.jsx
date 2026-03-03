import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AccountLayout from "../layouts/AccountLayout";
import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";


import Home from "../pages/public/Home";
import ProductList from "../pages/public/ProductList";
import ProductDetail from "../pages/public/ProductDetail";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import BrandList from "../pages/public/BrandList";
import BrandDetail from "../pages/public/BrandDetail";

import Login from "../pages/account/Login";
import Register from "../pages/account/Register";
import Cart from "../pages/account/Cart";
import Checkout from "../pages/account/Checkout";
import Orders from "../pages/account/Orders";
import OrderDetail from "../pages/account/OrderDetail";

import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminRoute from "../components/common/AdminRoute";
import Profile from "../pages/account/Profile";

import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";


/* admin */
import AdminDashboard from "../pages/admin/Dashboard";
import Brands from "../pages/admin/Brands";
import AdminCategories from "../pages/admin/Categories";
import AdminProducts from "../pages/admin/Products";



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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Customer */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AccountLayout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />

          </Route>
        </Route>

        {/* Admin */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/brands" element={<Brands />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/products" element={<AdminProducts />} />  
            <Route path="/admin/orders" element={<div>Orders</div>} />
            <Route path="/admin/settings" element={<div>Settings</div>} />
          </Route>
        </Route>

      </Routes>
  );
}
