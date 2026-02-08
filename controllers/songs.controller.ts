import { prisma } from "../utils/db";
import type { Request, Response } from "express";
import fs from "fs";
import path from "path";

export const uploadSong = async (req: Request, res: Response): Promise<any> => {
  const file = req.file;
  const rawTitle = req.body.title || "";
  const title = rawTitle.trim();
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

export const getSongFile = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { id } = req.params;

  try {
    const song = await prisma.song.findUnique({
      where: { id: Number(id) },
    });

    if (!song) return res.status(404).json({ error: "Canción no encontrada" });

    const absolutePath = path.join(process.cwd(), song.file_path);

    res.sendFile(absolutePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el archivo" });
  }
};

export const getAllSongs = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const userId = req.userId;

  if (!userId) return res.status(401).json({ error: "Token inválido" });

  try {
    const songs = await prisma.song.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        title: true,
        file_size: true,
        created_at: true,
      },
    });

    const songsReady = songs.map((song) => ({
      id: song.id,
      title: song.title,
      file_size: song.file_size,
      created_at: song.created_at,
      audio_url: `/api/songs/${song.id}/audio`,
    }));

    return res.json(songsReady);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las canciones" });
  }
};

export const deleteSong = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const song = await prisma.song.findUnique({
      where: { id: Number(id) },
    });

    if (!song) return res.status(404).json({ error: "Canción no encontrada" });

    // Verificar que la canción pertenece al usuario que la quiere borrar
    if (song.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para borrar esta canción" });
    }

    // Borrar el archivo físico del disco
    const absolutePath = path.join(process.cwd(), song.file_path);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await prisma.song.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "Canción eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminando canción:", error);
    return res.status(500).json({ error: "Error al eliminar la canción" });
  }
};
