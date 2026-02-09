import express from "express";
import router from "./routes/routes";
import cors from "cors";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    origin: ["http://tock.164.68.108.131.nip.io", "http://localhost:4200"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api", router);

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
