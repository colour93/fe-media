import { Router } from "express";
import _ from "lodash";
import { getTagCateList, getTagCateByCid } from "../../services/tag/cate";

const tagCateRouter = Router();

tagCateRouter.get('/', async (req, res) => {
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

tagCateRouter.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  res.send(await getTagCateByCid(_.toNumber(cid)));
});

export default tagCateRouter;