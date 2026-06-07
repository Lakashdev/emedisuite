import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  getTrendingProducts,
  saveTrendingProducts,
  getPublicTrendingProducts,
} from "../controllers/trendingProduct.controller.js";

export const trendingProductRoutes = Router();

// GET /api/trending-products  — public homepage
trendingProductRoutes.get("/", getPublicTrendingProducts);

// GET /api/trending-products/admin  — admin fetch list
trendingProductRoutes.get(
  "/admin",
  requireAuth,
  requireRole("admin"),
  getTrendingProducts
);

// PUT /api/trending-products/admin  — admin save list
trendingProductRoutes.put(
  "/admin",
  requireAuth,
  requireRole("admin"),
  saveTrendingProducts
);