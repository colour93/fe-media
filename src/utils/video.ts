import { ffprobe, FfprobeData } from "fluent-ffmpeg";

export const getVideoMetadata = (filePath: string): Promise<FfprobeData> => new Promise((resolve, reject) => {
  ffprobe(filePath, (err, metadata) => {
    if (err) {
      reject(err)
      return;
    }

    resolve(metadata);
  });
});