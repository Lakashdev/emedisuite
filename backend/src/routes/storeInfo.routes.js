// routes/storeInfo.routes.js
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { getStoreInfo, updateStoreInfo } from "../controllers/storeInfo.controller.js";

export const storeInfoRoutes = Router();

// Public — used by Footer, About page
storeInfoRoutes.get("/", getStoreInfo);

// Admin only
storeInfoRoutes.put("/admin", requireAuth, requireRole("admin"), updateStoreInfo);