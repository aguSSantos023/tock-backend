import { register } from "./../controllers/auth.controller";
import { Router } from "express";

const authRoutes = Router();

authRoutes.post("/register", register);

export default authRoutes;
