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
      .outputOptions(["-map_metadata -1", "-sn"]) //Quita tags y lyrics
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
