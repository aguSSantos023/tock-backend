import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/upload.middlewares";
import { getSongFile, uploadSong } from "../controllers/songs.controller";

const songRouter = Router();

songRouter.post("/", authenticateToken, upload.single("file"), uploadSong);
songRouter.get("/:id/audio", authenticateToken, getSongFile);

export default songRouter;
