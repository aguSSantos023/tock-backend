import ffmpeg from "fluent-ffmpeg";

// Extrae metadatos
export const getOpusMetadata = (path: string) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        console.log(metadata.format.tags);

        resolve(metadata.format.tags);
      }
    });
  });
};

// Convierte MP3 a OPUS
export const convertToOpusWithTags = (
  input: string,
  output: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .toFormat("opus")
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
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
      .on("error", (err) => reject(err))
      .save(output);
  });
};
