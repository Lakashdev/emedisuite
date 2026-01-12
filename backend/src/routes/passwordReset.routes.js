import { Router } from "express";
import { forgotPassword, verifyResetCode } from "../controllers/passwordReset.controller.js";
import { resetPassword } from "../controllers/resetPassword.controller.js";

const r = Router();

r.post("/auth/forgot-password", forgotPassword);
r.post("/auth/verify-reset-code", verifyResetCode);
r.post("/auth/reset-password", resetPassword);

export default r;
