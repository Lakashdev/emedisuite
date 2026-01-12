import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createCheckoutSession,
  getCheckoutSession,
  confirmCheckoutSession,
  cancelCheckoutSession,
} from "../controllers/checkoutSession.controller.js";

export const checkoutSessionRoutes = Router();

checkoutSessionRoutes.post("/", requireAuth, createCheckoutSession);
checkoutSessionRoutes.get("/:id", requireAuth, getCheckoutSession);
checkoutSessionRoutes.post("/:id/confirm", requireAuth, confirmCheckoutSession);
checkoutSessionRoutes.post("/:id/cancel", requireAuth, cancelCheckoutSession);
