import { extname } from "path";
import { VIDEO_EXTS } from "../consts/exts";
import { getAllFiles } from "../utils/fs"
import { config } from "../utils/preload"
import { createVideoDataFromLocalFile, setAllVideoInvalid } from "../services/video";

// 预处理视频文件
export const preprocessVideoFiles = async () => {

  await setAllVideoInvalid();

  const filePathList = getAllFiles(config.data.basePath).filter(({ filename }) => VIDEO_EXTS.includes(extname(filename).toLowerCase()));

  for (let i = 0; i < filePathList.length; i++) {
    const { absolutePath } = filePathList[i];
    await createVideoDataFromLocalFile(absolutePath)
  }

  console.log('Video files preloaded!');

}