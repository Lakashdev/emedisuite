import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getMyCart,
  addCartItem,
  updateCartItemQty,
  removeCartItem,
  mergeGuestCart,
} from "../controllers/cart.controller.js";

export const cartRoutes = Router();

cartRoutes.get("/", requireAuth, getMyCart);
cartRoutes.post("/items", requireAuth, addCartItem);
cartRoutes.put("/items/:id", requireAuth, updateCartItemQty);
cartRoutes.delete("/items/:id", requireAuth, removeCartItem);

// merge guest cart into DB cart
cartRoutes.post("/merge", requireAuth, mergeGuestCart);
