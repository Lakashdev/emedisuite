// routes/heroSlide.routes.js
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  listHeroSlides,
  adminListHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
} from "../controllers/heroSlide.controller.js";

export const heroSlideRoutes = Router();

// ── PUBLIC ──────────────────────────────────────────────────────────────────
heroSlideRoutes.get("/", listHeroSlides);

// ── ADMIN ────────────────────────────────────────────────────────────────────
heroSlideRoutes.get(
  "/admin",
  requireAuth, requireRole("admin"),
  adminListHeroSlides
);
heroSlideRoutes.post(
  "/admin",
  requireAuth, requireRole("admin"),
  createHeroSlide
);
heroSlideRoutes.patch(
  "/admin/reorder",
  requireAuth, requireRole("admin"),
  reorderHeroSlides
);
heroSlideRoutes.put(
  "/admin/:id",
  requireAuth, requireRole("admin"),
  updateHeroSlide
);
heroSlideRoutes.delete(
  "/admin/:id",
  requireAuth, requireRole("admin"),
  deleteHeroSlide
);