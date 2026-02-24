import { authenticateToken } from "../middlewares/auth.middlewares";
import {
  login,
  register,
  resendOtp,
  verifyOtp,
} from "./../controllers/auth.controller";
import { Router } from "express";

const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.post("/register", register);

authRoutes.post("/verify-otp", authenticateToken, verifyOtp);
authRoutes.post("/resend-otp", authenticateToken, resendOtp);

export default authRoutes;
