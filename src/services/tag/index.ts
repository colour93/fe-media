import { In } from "typeorm";
import { dataSource } from "../../app-data-source";
import { Tag } from "../../entities/tag.entity";
import { getTagCateByCid } from "./cate";
import _ from "lodash";
import { getVideosDataByNids } from "../video";
import { IPaginationDataFunction } from "../../typings/service";

export const getTagList: IPaginationDataFunction<Tag> = async ({ page, pageSize, relations = true, where }) => {
  const tagRepository = dataSource.getRepository(Tag);

  const [data, total] = await tagRepository.findAndCount({
    where,
    relations: { videos: relations, cate: true },
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

export const getTagByCid = async (cid: number, relations = false) => {
  const tagRepository = dataSource.getRepository(Tag);
  const tag = await tagRepository.findOne({ where: { cid }, relations: { videos: relations, cate: true } });
  return tag ? {
    code: 200,
    msg: null,
    data: tag
  } : {
    code: 404,
    msg: 'tag not found'
  };
}

export const getTagsByCids = async (cids: number[], relations = false) => {
  const tagRepository = dataSource.getRepository(Tag);
  const tags = await tagRepository.find({ where: { cid: In(cids) }, relations: { videos: relations, cate: true } });
  return {
    code: 200,
    msg: null,
    data: tags
  };
}

export const createTag = async (rawTag: Omit<Tag, 'cate' | 'videos'> & { cate: number; videos?: string[] }) => {
  const tagRepository = dataSource.getRepository(Tag);

  if (!rawTag.cate) return {
    code: 400,
    msg: 'tag category not found'
  }

  const tagCate = (await getTagCateByCid(rawTag.cate)).data;

  if (!tagCate) return {
    code: 404,
    msg: 'tag category not found'
  }

  const videos = _.isArray(rawTag.videos) && rawTag.videos.length > 0 ? (await getVideosDataByNids(rawTag.videos)).data : undefined;

  const tagData = _.omit(rawTag, ['cid']);

  const tag = tagRepository.create({
    ...tagData,
    videos,
    cate: tagCate
  });
  try {
    const newTag = await tagRepository.save(tag);
    return {
      code: 201,
      msg: null,
      data: newTag
    };
  } catch (error) {
    return {
      code: 400,
      msg: error['message']
    }
  }
}

export const updateTagByCid = async (cid: number, tagData: Partial<Omit<Tag, 'cate' | 'videos'> & { cate?: number; videos?: string[] }>) => {
  const tagRepository = dataSource.getRepository(Tag);

  const existTag = await tagRepository.findOne({ where: { cid }, relations: { videos: true, cate: true } });

  if (!existTag) return {
    code: 404,
    msg: 'tag not found'
  }

  const processedTagData = _.omit(tagData, ['cate', 'videos', 'cid']);

  const tagCate = tagData.cate ? (await getTagCateByCid(tagData.cate)).data : undefined;

  if (tagData.cate && !tagCate) return {
    code: 404,
    msg: 'tag category not found'
  }

  const videos = _.isArray(tagData.videos) && tagData.videos.length > 0 ? (await getVideosDataByNids(tagData.videos)).data : undefined;

  try {
    const newTag = await tagRepository.save({
      ...existTag,
      ...processedTagData,
      ...{
        tagCate,
        videos
      }
    });
    return {
      code: 201,
      msg: null,
      data: newTag
    };
  } catch (error) {
    return {
      code: 400,
      msg: error['message']
    }
  }
}

export const deleteTagByCid = async (cid: number) => {
  const tagRepository = dataSource.getRepository(Tag);

  const { affected } = await tagRepository.delete({ cid });

  return affected != 0 ? {
    code: 200,
    msg: null
  } : {
    code: 404,
    msg: 'tag not found'
  }
}