import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { getAdminStats } from "../controllers/admin.controller.js";

export const adminRoutes = Router();

adminRoutes.get("/stats", requireAuth, requireRole("admin"), getAdminStats);