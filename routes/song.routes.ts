import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/upload.middlewares";
import {
  getAllSongs,
  getSongFile,
  uploadSong,
} from "../controllers/songs.controller";

const songRouter = Router();

songRouter.post("/", authenticateToken, upload.single("file"), uploadSong);
songRouter.get("/:id/audio", authenticateToken, getSongFile);
songRouter.get("/", authenticateToken, getAllSongs);

export default songRouter;
