import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  getAdminOrderById,
  getAdminStats,
  listAdminOrders,
  updateAdminOrderStatus,
} from "../controllers/admin.controller.js";

export const adminRoutes = Router();

adminRoutes.get("/stats", requireAuth, requireRole("admin"), getAdminStats);
adminRoutes.get("/orders", requireAuth, requireRole("admin"), listAdminOrders);
adminRoutes.get("/orders/:id", requireAuth, requireRole("admin"), getAdminOrderById);
adminRoutes.patch("/orders/:id/status", requireAuth, requireRole("admin"), updateAdminOrderStatus);
