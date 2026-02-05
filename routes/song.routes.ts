import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/upload.middlewares";
import { uploadSong } from "../controllers/songs.controller";

const songRouter = Router();

songRouter.post("/", authenticateToken, upload.single("file"), uploadSong);

export default songRouter;
