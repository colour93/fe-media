import { Router } from "express";
import manageTagCateRouter from "./cate";
import { createTag, deleteTagByCid, getTagList, updateTagByCid } from "../../../services/tag";
import _ from "lodash";
import { getTagCateByCid } from "../../../services/tag/cate";

const manageTagRouter = Router();

manageTagRouter.use('/cate', manageTagCateRouter);

manageTagRouter.get('/', async (req, res) => {
  const { page: rawPage, pageSize: rawPageSize, tagCateCid: rawTagCateCid } = req.query;
  const page = parseInt((rawPage ?? 1).toString());
  const pageSize = parseInt((rawPageSize ?? 20).toString());
  const tagCateCid = _.isUndefined(rawTagCateCid) ? undefined : parseInt(rawTagCateCid.toString());

  const { data, ...rest } = await getTagList({
    page: _.isNumber(page) ? page : undefined,
    pageSize: _.isNumber(pageSize) ? pageSize : undefined,
    where: _.isNumber(tagCateCid) ? {
      cate: {
        cid: tagCateCid
      }
    } : undefined
  });
  res.send({
    code: 200,
    msg: null,
    data,
    ...rest
  })
});

manageTagRouter.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  res.send(await getTagCateByCid(_.toNumber(cid)));
})

manageTagRouter.post('/', async (req, res) => res.send(await createTag(req.body)));

manageTagRouter.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  res.send(await updateTagByCid(_.toNumber(cid), req.body));
})

manageTagRouter.delete('/:cid', async (req, res) => {
  const { cid } = req.params;
  res.send(await deleteTagByCid(_.toNumber(cid)));
})

export default manageTagRouter;