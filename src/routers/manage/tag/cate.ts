import { Router } from "express";
import _ from "lodash";
import { createTagCate, deleteTagCateByCid, getTagCateByCid, getTagCateList, updateTagCateByCid } from "../../../services/tag/cate";

const manageTagCateRouter = Router();

manageTagCateRouter.get('/', async (req, res) => {
  const { page: rawPage, pageSize: rawPageSize } = req.query;
  const page = parseInt((rawPage ?? 1).toString());
  const pageSize = parseInt((rawPageSize ?? 20).toString());

  const { data, ...rest } = await getTagCateList({
    page: _.isNumber(page) ? page : undefined,
    pageSize: _.isNumber(pageSize) ? pageSize : undefined
  });
  res.send({
    code: 200,
    msg: null,
    data,
    ...rest
  })
});

manageTagCateRouter.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  res.send(await getTagCateByCid(_.toNumber(cid)));
});

manageTagCateRouter.post('/', async (req, res) => res.send(await createTagCate(req.body)));

manageTagCateRouter.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  res.send(await updateTagCateByCid(_.toNumber(cid), req.body));
})

manageTagCateRouter.delete('/:cid', async (req, res) => {
  const { cid } = req.params;
  res.send(await deleteTagCateByCid(_.toNumber(cid)));
})

export default manageTagCateRouter;