import express from "express";
import router from "./routes/routes";
import cors from "cors";
import { CleanupService } from "./services/cleanup.service";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    origin: ["https://tock-music.agussantos.dev", "http://localhost:4200"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api", router);

CleanupService.initCleanupCron();

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
