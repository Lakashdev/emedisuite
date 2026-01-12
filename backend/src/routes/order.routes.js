import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { placeOrder, listMyOrders, getOrderById } from "../controllers/order.controller.js";

export const orderRoutes = Router();

orderRoutes.post("/", requireAuth, placeOrder);
orderRoutes.get("/my", requireAuth, listMyOrders);
orderRoutes.get("/:id", requireAuth, getOrderById);
