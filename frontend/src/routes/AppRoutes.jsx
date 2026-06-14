import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Loader from "../components/common/Loader.jsx";

import PublicLayout from "../layouts/PublicLayout";
import AccountLayout from "../layouts/AccountLayout";
import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminRoute from "../components/common/AdminRoute";
import NotFound from "../pages/NotFound";

/* ── Public (eager) ── */
import Home from "../pages/public/Home";
import ProductList from "../pages/public/ProductList";
import ProductDetail from "../pages/public/ProductDetail";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import BrandList from "../pages/public/BrandList";
import BrandDetail from "../pages/public/BrandDetail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

/* ── Auth ── */
import Login from "../pages/account/Login";
import Register from "../pages/account/Register";

/* ── Account (lazy) ── */
const Cart = lazy(() => import("../pages/account/Cart"));
const Checkout = lazy(() => import("../pages/account/Checkout"));
const Orders = lazy(() => import("../pages/account/Orders"));
const OrderDetail = lazy(() => import("../pages/account/OrderDetail"));
const Profile = lazy(() => import("../pages/account/Profile"));

/* ── Admin (lazy) ── */
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
const Brands = lazy(() => import("../pages/admin/Brands"));
const AdminCategories = lazy(() => import("../pages/admin/Categories"));
const AdminProducts = lazy(() => import("../pages/admin/Products"));
const AdminOrders = lazy(() => import("../pages/admin/Orders"));
const AdminOrderDetail = lazy(() => import("../pages/admin/OrderDetail"));
const AdminUsers = lazy(() => import("../pages/admin/Users"));
const AdminUserDetail = lazy(() => import("../pages/admin/UserDetail"));
const Settings = lazy(() => import("../pages/admin/Settings"));
const HeroSlides = lazy(() => import("../pages/admin/HeroSlides"));
const StoreInfoSettings = lazy(() => import("../pages/admin/StoreInfoSettings"));
const TrendingProducts = lazy(() => import("../pages/admin/TrendingProducts"));
const DeliverySettings = lazy(() => import("../pages/admin/DeliverySettings"));

const Spinner = () => <Loader fullPage />;

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ── */}
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

      {/* ── Auth ── */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ── Protected Account ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AccountLayout />}>
          <Route path="/profile" element={<Suspense fallback={<Spinner />}><Profile /></Suspense>} />
          <Route path="/cart" element={<Suspense fallback={<Spinner />}><Cart /></Suspense>} />
          <Route path="/checkout" element={<Suspense fallback={<Spinner />}><Checkout /></Suspense>} />
          <Route path="/orders" element={<Suspense fallback={<Spinner />}><Orders /></Suspense>} />
          <Route path="/orders/:id" element={<Suspense fallback={<Spinner />}><OrderDetail /></Suspense>} />
        </Route>
      </Route>

      {/* ── Admin ── */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Suspense fallback={<Spinner />}><AdminDashboard /></Suspense>} />
          <Route path="/admin/brands" element={<Suspense fallback={<Spinner />}><Brands /></Suspense>} />
          <Route path="/admin/categories" element={<Suspense fallback={<Spinner />}><AdminCategories /></Suspense>} />
          <Route path="/admin/products" element={<Suspense fallback={<Spinner />}><AdminProducts /></Suspense>} />
          <Route path="/admin/orders" element={<Suspense fallback={<Spinner />}><AdminOrders /></Suspense>} />
          <Route path="/admin/orders/:id" element={<Suspense fallback={<Spinner />}><AdminOrderDetail /></Suspense>} />
          <Route path="/admin/users" element={<Suspense fallback={<Spinner />}><AdminUsers /></Suspense>} />
          <Route path="/admin/users/:id" element={<Suspense fallback={<Spinner />}><AdminUserDetail /></Suspense>} />
          <Route path="/admin/settings" element={<Suspense fallback={<Spinner />}><Settings /></Suspense>} />
          <Route path="/admin/settings/hero-slides" element={<Suspense fallback={<Spinner />}><HeroSlides /></Suspense>} />
          <Route path="/admin/settings/store-info" element={<Suspense fallback={<Spinner />}><StoreInfoSettings /></Suspense>} />
          <Route path="/admin/settings/trending-products" element={<Suspense fallback={<Spinner />}><TrendingProducts /></Suspense>} />
          <Route path="/admin/settings/delivery" element={<Suspense fallback={<Spinner />}><DeliverySettings /></Suspense>} />
        </Route>
      </Route>

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
