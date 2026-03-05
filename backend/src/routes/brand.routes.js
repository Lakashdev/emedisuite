import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { uploadBrandLogo } from "../middleware/brandUpload.middleware.js";
import {
  listBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller.js";

export const brandRoutes = Router();

// public
brandRoutes.get("/", listBrands);
brandRoutes.get("/:id", getBrand);

// admin
brandRoutes.post("/", requireAuth, requireRole("admin"),uploadBrandLogo.single("logo"), createBrand);
brandRoutes.put("/:id", requireAuth, requireRole("admin"),uploadBrandLogo.single("logo"), updateBrand);
brandRoutes.delete("/:id", requireAuth, requireRole("admin"), deleteBrand);
