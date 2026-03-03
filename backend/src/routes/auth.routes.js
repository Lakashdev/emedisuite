import { Router } from "express";
import { register, login, verifyEmail, resendEmailCode } from "../controllers/auth.controller.js";
import { forgotPassword, resetPassword } from "../controllers/passwordReset.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", resetPassword);


authRoutes.post("/verify-email", requireAuth, verifyEmail);
authRoutes.post("/resend-email-code", requireAuth, resendEmailCode);
export default authRoutes;
