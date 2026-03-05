import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { uploadProductImages } from "../config/upload.js";

import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

export const productRoutes = Router();

// public
productRoutes.get("/", listProducts);
productRoutes.get("/:id", getProductById);

// admin
productRoutes.post("/", requireAuth, requireRole("admin"),uploadProductImages.array("images", 10), createProduct);
productRoutes.put("/:id", requireAuth, requireRole("admin"),uploadProductImages.array("images", 10), updateProduct);
productRoutes.delete("/:id", requireAuth, requireRole("admin"), deleteProduct);
