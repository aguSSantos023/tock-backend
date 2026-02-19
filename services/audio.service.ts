import ffmpeg from "fluent-ffmpeg";
import fs from "fs";

export interface AudioTags {
  title?: string;
  artist?: string;
  album?: string;
  date?: string;
}

export interface AudioMetadata {
  format: {
    duration?: number;
    tags?: AudioTags;
  };
}

// Extrae metadatos
export const getMetadata = (path: string): Promise<AudioMetadata> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err)
        return reject(new Error(`Error al leer metadatos: ${err.message}`));

      resolve(metadata as unknown as AudioMetadata);
    });
  });
};

// Convierte MP3 a OPUS
export const convertToOpus = (input: string, output: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .toFormat("opus")
      .on("end", () => resolve())
      .on("error", (err: Error) => {
        reject(new Error(`Error en conversión a Opus: ${err.message}`));
      })
      .save(output);
  });
};

// Limpieza total de metadatos
export const stripMetadata = (input: string, output: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .noVideo() //Quitar caratula
      .outputOptions([
        "-map 0:a", // SELECCIÓN: Solo copia el flujo de audio, ignora todo lo demás
        "-map_metadata -1", // LIMPIEZA: Borra metadatos globales (título, artista, etc.)
        "-map_chapters -1", // LIMPIEZA: Borra marcas de capítulos
        "-sn", // LIMPIEZA: Elimina subtítulos o letras (lyrics)
        "-dn", // LIMPIEZA: Elimina flujos de datos (metadatos de hardware, etc.)
        "-c:a copy", // CALIDAD: Copia el audio tal cual, sin re-codificar (evita pérdida de calidad)
      ])
      .on("end", () => resolve())
      .on("error", (err: Error) => {
        reject(new Error(`Error al limpiar metadatos: ${err.message}`));
      })
      .save(output);
  });
};

export const generateFinalName = (): string => {
  const random = Math.floor(10000 + Math.random() * 90000); // 5 dígitos
  return `${Date.now()}-${random}.opus`;
};

export const deleteFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};
