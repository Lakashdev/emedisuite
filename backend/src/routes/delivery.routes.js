import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  adminCreateDeliveryZone,
  adminDeleteDeliveryZone,
  adminGetDeliveryConfig,
  adminUpdateDeliverySettings,
  adminUpdateDeliveryZone,
  getDeliverySettings,
  listDeliveryZones,
  quoteDelivery,
} from "../controllers/delivery.controller.js";

export const deliveryRoutes = Router();

deliveryRoutes.get("/zones", listDeliveryZones);
deliveryRoutes.get("/settings", getDeliverySettings);
deliveryRoutes.post("/quote", quoteDelivery);

deliveryRoutes.get("/admin", requireAuth, requireRole("admin"), adminGetDeliveryConfig);
deliveryRoutes.put("/admin/settings", requireAuth, requireRole("admin"), adminUpdateDeliverySettings);
deliveryRoutes.post("/admin/zones", requireAuth, requireRole("admin"), adminCreateDeliveryZone);
deliveryRoutes.put("/admin/zones/:id", requireAuth, requireRole("admin"), adminUpdateDeliveryZone);
deliveryRoutes.delete("/admin/zones/:id", requireAuth, requireRole("admin"), adminDeleteDeliveryZone);
