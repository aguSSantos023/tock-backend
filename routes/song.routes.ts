import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/upload.middlewares";
import {
  deleteSong,
  getSongsPaged,
  getSongFile,
  uploadSong,
} from "../controllers/songs.controller";

const songRouter = Router();

songRouter.use(authenticateToken);

songRouter.post("/", upload.single("file"), uploadSong);
songRouter.get("/:id/audio", getSongFile);
songRouter.get("/", getSongsPaged);
songRouter.delete("/:id", deleteSong);

export default songRouter;
