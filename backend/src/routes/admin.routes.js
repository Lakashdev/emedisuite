import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  getAdminOrderById,
  getAdminStats,
  getAdminUserById,
  listAdminUsers,
  listAdminOrders,
  updateAdminUser,
  updateAdminOrderStatus,
  verifyAdminUserEmail,
} from "../controllers/admin.controller.js";

export const adminRoutes = Router();

adminRoutes.get("/stats", requireAuth, requireRole("admin"), getAdminStats);
adminRoutes.get("/users", requireAuth, requireRole("admin"), listAdminUsers);
adminRoutes.get("/users/:id", requireAuth, requireRole("admin"), getAdminUserById);
adminRoutes.patch("/users/:id", requireAuth, requireRole("admin"), updateAdminUser);
adminRoutes.patch("/users/:id/verify-email", requireAuth, requireRole("admin"), verifyAdminUserEmail);
adminRoutes.get("/orders", requireAuth, requireRole("admin"), listAdminOrders);
adminRoutes.get("/orders/:id", requireAuth, requireRole("admin"), getAdminOrderById);
adminRoutes.patch("/orders/:id/status", requireAuth, requireRole("admin"), updateAdminOrderStatus);
