import express from "express";

const app = express();
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hola desde el back 🐳");
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
