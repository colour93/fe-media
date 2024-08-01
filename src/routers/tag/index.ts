import { Router } from "express";
import tagCateRouter from "./cate";
import { getTagList } from "../../services/tag";
import { getTagCateByCid } from "../../services/tag/cate";
import _ from "lodash";

const tagRouter = Router();

tagRouter.use('/cate', tagCateRouter);

tagRouter.get('/', async (req, res) => {
  const { page: rawPage, pageSize: rawPageSize } = req.query;
  const page = parseInt((rawPage ?? 1).toString());
  const pageSize = parseInt((rawPageSize ?? 20).toString());

  const { data, ...rest } = await getTagList({
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

tagRouter.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  res.send(await getTagCateByCid(_.toNumber(cid)));
})

export default tagRouter;