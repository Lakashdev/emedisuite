import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
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
productRoutes.post("/", requireAuth, requireRole("admin"), createProduct);
productRoutes.put("/:id", requireAuth, requireRole("admin"), updateProduct);
productRoutes.delete("/:id", requireAuth, requireRole("admin"), deleteProduct);
