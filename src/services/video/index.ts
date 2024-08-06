import { basename, extname, relative, resolve } from "path";
import { dataSource } from "../../app-data-source";
import { Video } from "../../entities/video.entity";
import { config } from "../../utils/preload";
import { calculateHash } from "../../utils/crypto";
import _ from "lodash";
import { cloneThumbFileById, genThumbFileById, getThumbFileById } from "./thumb";
import { accessSync, statSync } from "fs";
import { getVideoMetadata } from "../../utils/video";
import { IPaginationDataFunction } from "../../typings/service";
import { getTagByCid, getTagsByCids } from "../tag";
import { In } from "typeorm";

export const getVideoList: IPaginationDataFunction<Video> = async ({ page, pageSize, relations = true }) => {
  const videoRepository = dataSource.getRepository(Video);

  const [data, total] = await videoRepository.findAndCount({
    where: [
      {
        invalid: false
      },
      {
        invalid: null
      }
    ],
    relations: {
      tags: {
        cate: relations
      }
    },
    skip: ((page - 1) * pageSize) || 0,
    take: pageSize
  });

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: pageSize ? Math.ceil(total / pageSize) : undefined,
  };
}

export const getVideoDataByNid = async (nid: string, relations = true) => {
  const videoRepository = dataSource.getRepository(Video);
  const video = await videoRepository.findOne({ where: { nid }, relations: { tags: { cate: relations } } });
  return video ? {
    code: 200,
    msg: null,
    data: video
  } : {
    code: 404,
    msg: 'video not found'
  };
}

export const getVideosDataByNids = async (nids: string[], relations = true) => {
  const videoRepository = dataSource.getRepository(Video);
  const videos = await videoRepository.find({ where: { nid: In(nids) }, relations: { tags: relations } });
  return {
    code: 200,
    msg: null,
    data: videos
  }
}

export const createVideoDataFromLocalFile: (absolutePath: string) => Promise<{
  code: number;
  video?: Video;
}> = async (absolutePath) => {
  const videoRepository = dataSource.getRepository(Video);

  const { basePath } = config.data;
  const relativePath = relative(basePath, absolutePath);
  const filename = basename(absolutePath);
  const hash = await calculateHash(absolutePath);
  const { size, ctimeMs, mtimeMs } = statSync(absolutePath);

  const existVideos = await videoRepository.find({
    where: [
      { filename },
      { size }
    ]
  });

  const newSameExistVideo = existVideos.find(ev => ev.hash === hash && ev.relativePath !== relativePath);
  const oldDiffExistVideo = existVideos.find(ev => ev.hash != hash && ev.relativePath === relativePath);
  const oldSameExistVideo = existVideos.find(ev => ev.hash == hash && ev.relativePath === relativePath)

  let video: Video | undefined;
  let code = 200;

  if (newSameExistVideo) {
    // 新文件，但是 hash 一致

    // 判断旧文件还在不在
    try {
      accessSync(resolve(newSameExistVideo.basePath, newSameExistVideo.relativePath));
      const restData = _.omit(newSameExistVideo, ['basePath', 'filename', 'nid', 'cid', 'relativePath', 'importedAt', 'updatedAt']);
      const newVideoEntity = videoRepository.create({
        ...restData,
        filename,
        basePath,
        relativePath,
        invalid: false
      })
      const newVideo = await videoRepository.save(newVideoEntity);
      cloneThumbFileById(newSameExistVideo.nid, newVideo.nid);
      video = newVideo;
      code = 201;
    } catch (error) {

      // 旧文件不存在，则只变更 path
      const restData = _.omit(newSameExistVideo, ['basePath', 'filename', 'relativePath']);
      const newVideo = await videoRepository.save({
        ...restData,
        filename,
        basePath,
        relativePath,
        invalid: false
      })
      video = newVideo;
      code = 200;

    }

  } else if (oldDiffExistVideo) {
    // 旧文件，但是 hash 不一致
    const metadata = await getVideoMetadata(absolutePath);
    const { duration } = metadata.format;

    const restData = _.omit(oldDiffExistVideo, ['basePath', 'size', 'duration', 'hash', 'modifiedAt', 'createdAt']);
    const newVideo = await videoRepository.save({
      ...restData,
      basePath,
      size,
      duration,
      hash,
      createdAt: new Date(ctimeMs),
      modifiedAt: new Date(mtimeMs),
      invalid: false
    });
    await genThumbFileById(newVideo.nid);
    video = newVideo;
    code = 200;

  } else if (oldSameExistVideo) {
    // 旧文件，但是 hash 一致
    const newVideo = await videoRepository.save({
      ...oldSameExistVideo,
      invalid: false
    })
    video = newVideo;
    code = 304;

  } else {
    // 新文件
    const metadata = await getVideoMetadata(absolutePath);
    const { duration } = metadata.format;

    const newVideoEntity = videoRepository.create({
      title: basename(filename, extname(filename)),
      basePath,
      relativePath,
      filename,
      size,
      duration,
      hash,
      createdAt: new Date(ctimeMs),
      modifiedAt: new Date(mtimeMs),
    });
    const newVideo = await videoRepository.save(newVideoEntity);
    await genThumbFileById(newVideo.nid);
    video = newVideo;
    code = 201;
  }

  if (video && !getThumbFileById(video.nid)) genThumbFileById(video.nid);

  return {
    code,
    video
  }
}

export const setVideoInvalidFromLocalFile: (absolutePath: string) => Promise<{
  code: number;
  video?: Video;
}> = async (absolutePath) => {
  const videoRepository = dataSource.getRepository(Video);

  const { basePath } = config.data;
  const relativePath = relative(basePath, absolutePath);

  const existVideo = await videoRepository.findOneBy({
    relativePath,
    basePath,
  })

  if (existVideo && !existVideo.invalid) {
    existVideo.invalid = true;
    const video = await videoRepository.save(existVideo);

    return {
      code: 200,
      video
    }
  }

  return {
    code: 404
  }

}

export const setAllVideoInvalid = async () => {
  const videoRepository = dataSource.getRepository(Video);
  return await videoRepository.update({}, { invalid: true });
}

export const updateVideoDataByNid = async (nid: string, videoData: Partial<Omit<Video, 'tags'> & { tags: number[] }>) => {
  const videoRepository = dataSource.getRepository(Video);

  const existVideo = await videoRepository.findOne({
    where: { nid },
    relations: { tags: true }
  })

  if (!existVideo) return {
    code: 404,
    msg: 'video not found',
  }

  const processedVideoData = _.pick(videoData, ['basePath', 'relativePath', 'filename', 'title', 'description']);

  const tags = _.isArray(videoData.tags) && videoData.tags.length > 0 ? (await getTagsByCids(videoData.tags)).data : undefined;

  try {
    const newVideo = await videoRepository.save({
      ...existVideo,
      ...processedVideoData,
      ...{ tags }
    });
    return {
      code: 200,
      msg: null,
      data: newVideo
    };
  } catch (error) {
    return {
      code: 400,
      msg: error['message']
    }
  }

}

export const addTagToVideo = async (videoNid: string, tagCid: number) => {
  const videoRepository = dataSource.getRepository(Video);

  const existVideo = await videoRepository.findOne({
    where: {
      nid: videoNid,
    },
    relations: {
      tags: {
        cate: true
      }
    }
  })

  if (!existVideo) return {
    code: 404,
    msg: 'video not found'
  }

  if (existVideo.tags && existVideo.tags.find(tag => tag.cid === tagCid)) return {
    code: 304,
    msg: 'tag is exist'
  }

  const existTag = await getTagByCid(tagCid);

  if (existTag.code != 200) return existTag;

  existVideo.tags.push(existTag.data);

  try {
    const newVideo = await videoRepository.save(existVideo);
    return {
      code: 200,
      msg: null,
      data: newVideo
    };
  } catch (error) {
    return {
      code: 400,
      msg: error['message']
    }
  }
}