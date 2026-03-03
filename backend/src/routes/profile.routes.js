import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getMe, updateMe, getProfileSummary, getRecentOrders, getRecentProducts } from "../controllers/profile.controller.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);

router.get("/summary", requireAuth, getProfileSummary);
router.get("/recent-orders", requireAuth, getRecentOrders);
router.get("/recent-products", requireAuth, getRecentProducts);

export default router;
