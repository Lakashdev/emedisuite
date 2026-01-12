import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

export const categoryRoutes = Router();

// public
categoryRoutes.get("/", listCategories);
categoryRoutes.get("/:id", getCategory);

// admin
categoryRoutes.post("/", requireAuth, requireRole("admin"), createCategory);
categoryRoutes.put("/:id", requireAuth, requireRole("admin"), updateCategory);
categoryRoutes.delete("/:id", requireAuth, requireRole("admin"), deleteCategory);
