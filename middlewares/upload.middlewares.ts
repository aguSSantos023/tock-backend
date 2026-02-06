import fs from "fs";
import multer from "multer";
import path from "path";

const uploadDir = "uploads";

// Crear carpeta si no existe (evita crash al inicio)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único (Timestamp + Random) para evitar sobrescrituras
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Validar solo archivos de audio (mimetype: audio/mp3, audio/wav, etc.)
  if (file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos de audio"), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // Máx: 50MB
  },
});
