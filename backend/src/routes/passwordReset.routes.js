import { Router } from "express";
import { forgotPassword } from "../controllers/passwordReset.controller.js";
import { resetPassword } from "../controllers/resetPassword.controller.js";

const r = Router();

r.post("/forgot-password", forgotPassword);
r.post("/reset-password", resetPassword);

export default r;