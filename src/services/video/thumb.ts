import { cpSync, readFileSync, writeFileSync } from "fs"
import { resolve } from "path";
import { config } from "../../utils/preload";
import ffmpeg from "fluent-ffmpeg";
import { dataSource } from "../../app-data-source";
import { Video } from "../../entities/video.entity";

export const getThumbFileById = (id: string): Buffer | null => {

  const thumbPath = resolve(config.data.thumbPath, `${id}.png`);

  try {
    return readFileSync(thumbPath);
  } catch (error) {
    return null;
  }

}

export const genThumbFileById = async (id: string, thumb?: Buffer): Promise<boolean> => {

  const videoRepository = dataSource.getRepository(Video);

  const video = await videoRepository.findOneBy({ nid: id });

  if (!video) return false;

  const thumbPath = resolve(config.data.thumbPath, `${id}.png`);

  if (thumb) {
    try {
      writeFileSync(thumbPath, thumb);
      return true;
    } catch (error) {
      return false;
    }
  } else {
    ffmpeg(resolve(video.basePath, video.relativePath))
      .screenshots({
        timestamps: [Math.random() * video.duration],
        filename: `${id}.png`,
        folder: config.data.thumbPath,
        size: '?x360'
      })
      .on('end', () => {
        return true;
      })
      .on('error', () => {
        return false;
      });
  }

}

export const cloneThumbFileById = (originId: string, targetId: string): boolean => {

  const originThumbPath = resolve(config.data.thumbPath, `${originId}.png`);
  const targetThumbPath = resolve(config.data.thumbPath, `${targetId}.png`);

  try {
    cpSync(originThumbPath, targetThumbPath);
    return true;
  } catch (error) {
    return false;
  }

}