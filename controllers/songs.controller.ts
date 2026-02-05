import { prisma } from "../utils/db";
import type { Request, Response } from "express";
import fs from "fs";

export const uploadSong = async (req: Request, res: Response): Promise<any> => {
  const file = req.file;
  const { title } = req.body;
  const userId = req.userId;

  if (!file) {
    return res.status(400).json({ error: "No se ha subido ningún archivo" });
  }

  if (!title) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ error: "El título es obligatorio" });
  }

  try {
    const newSong = await prisma.song.create({
      data: {
        title: title,
        file_path: file.path,
        file_size: file.size, // Multer nos da el tamaño en bytes
        user_id: userId!,
      },
    });

    return res.status(201).json({
      message: "Canción subida con éxito",
      song: {
        ...newSong,
        file_size: newSong.file_size.toString(),
      },
    });
  } catch (error) {
    console.error(error);

    // CLEANUP: Si falla la BD se borra el archivo físico
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);

    return res.status(500).json({ message: "Error al guardar la canción" });
  }
};
