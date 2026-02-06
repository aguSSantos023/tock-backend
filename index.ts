import express from "express";
import router from "./routes/routes";

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use("/api", router);

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
