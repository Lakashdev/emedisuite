import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { cancelMyOrder, createReturnRequest } from "../controllers/orderActions.controller.js";

export const orderActionsRoutes = Router();

orderActionsRoutes.post("/orders/:id/cancel", requireAuth, cancelMyOrder);
orderActionsRoutes.post("/orders/:id/return-request", requireAuth, createReturnRequest);
