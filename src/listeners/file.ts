import { watch } from "chokidar";
import { config } from "../utils/preload";
import { extname } from "path";
import { VIDEO_EXTS } from "../consts/exts";
import { createVideoDataFromLocalFile, setVideoInvalidFromLocalFile } from "../services/video";
import { waitForFileToUnlock } from "../utils/fs";

export const startFileListener = () => {


  const watcher = watch(config.data.basePath, {
    persistent: true,
    ignoreInitial: true
  });

  watcher
    .on('add', async (path) => {
      if (await waitForFileToUnlock(path) && VIDEO_EXTS.includes(extname(path).toLowerCase())) {
        await createVideoDataFromLocalFile(path);
      }
    })
    .on('change', async (path) => {
      if (await waitForFileToUnlock(path) && VIDEO_EXTS.includes(extname(path).toLowerCase())) {
        await createVideoDataFromLocalFile(path);
      }
    })
    .on('unlink', async (path) => {
      if (VIDEO_EXTS.includes(extname(path).toLowerCase())) {
        await setVideoInvalidFromLocalFile(path);
      }
    })

}