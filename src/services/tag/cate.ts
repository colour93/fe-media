import _ from "lodash";
import { dataSource } from "../../app-data-source";
import { TagCate } from "../../entities/tag-cate.entity";
import { IPaginationDataFunction } from "../../typings/service";

type ITagCateResult = Promise<{
  code: number;
  msg: string | null;
  data?: TagCate;
}>

export const createTagCate: (rawTagCate: Omit<TagCate, 'cid'>) => ITagCateResult = async (rawTagCate) => {
  const tagCateRepository = dataSource.getRepository(TagCate);

  const tagCateData = _.omit(rawTagCate, ['cid']);

  const tagCate = tagCateRepository.create(tagCateData);
  try {
    const newTagCate = await tagCateRepository.save(tagCate);
    return {
      code: 201,
      msg: null,
      data: newTagCate
    };
  } catch (error) {
    return {
      code: 400,
      msg: error['message']
    }
  }
}

export const deleteTagCateByCid: (cid: number) => ITagCateResult = async (cid) => {
  const tagCateRepository = dataSource.getRepository(TagCate);

  const { affected } = await tagCateRepository.delete({ cid });

  return affected != 0 ? {
    code: 200,
    msg: null
  } : {
    code: 404,
    msg: 'tag category not found'
  }
}

export const getTagCateByCid: (cid: number, relations?: boolean) => ITagCateResult = async (cid, relations = true) => {
  const tagCateRepository = dataSource.getRepository(TagCate);

  const tagCate = await tagCateRepository.findOne({ where: { cid }, relations: { tags: true } });

  return tagCate ? {
    code: 200,
    msg: null,
    data: tagCate
  } : {
    code: 404,
    msg: 'tag category not found'
  }
}

export const getTagCateList: IPaginationDataFunction<TagCate> = async ({ page, pageSize, relations = true }) => {
  const tagCateRepository = dataSource.getRepository(TagCate);

  const [data, total] = await tagCateRepository.findAndCount({
    relations: { tags: relations },
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

export const updateTagCateByCid: (cid: number, tagCateData: Partial<TagCate>) => ITagCateResult = async (cid, tagCateData) => {
  const tagCateRepository = dataSource.getRepository(TagCate);

  const tagCate = await tagCateRepository.findOneBy({ cid });

  if (!tagCate) return {
    code: 404,
    msg: "tag category not found"
  }

  const newData = _.pick(tagCateData, ['color', 'displayName', 'name']);

  try {
    const newTagCate = await tagCateRepository.save({
      ...tagCate,
      ...newData
    });
    return {
      code: 200,
      msg: null,
      data: newTagCate
    };
  } catch (error) {
    return {
      code: 400,
      msg: error['message']
    }
  }
}