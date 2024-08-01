import { Router } from "express";
import { addTagToVideo, getVideoDataByNid, getVideoList, updateVideoDataByNid } from "../../services/video";
import _ from "lodash";

const manageVideoRouter = Router();

manageVideoRouter.get('/', async (req, res) => {
  const { page: rawPage, pageSize: rawPageSize } = req.query;
  const page = _.toNumber((rawPage ?? 1).toString());
  const pageSize = _.toNumber((rawPageSize ?? 20).toString());

  const { data, ...rest } = await getVideoList({
    page: _.isNumber(page) ? page : undefined,
    pageSize: _.isNumber(pageSize) ? pageSize : undefined
  });
  res.send({
    code: 200,
    msg: null,
    data,
    ...rest
  })
})

manageVideoRouter.get('/:nid', async (req, res) => {
  const { nid } = req.params;
  res.send(await getVideoDataByNid(nid));
})

manageVideoRouter.put('/:nid', async (req, res) => {
  const { nid } = req.params;
  res.send(await updateVideoDataByNid(nid, req.body));
})

manageVideoRouter.post('/:nid/tag', async (req, res) => {
  const { nid } = req.params;
  const { cid } = req.body;
  res.send(await addTagToVideo(nid, _.toNumber(cid)));
})

export default manageVideoRouter;
