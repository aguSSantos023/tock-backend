import express from "express";
import authRoutes from "./routes/auth.routes";

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hola desde el back 🐳");
});

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
