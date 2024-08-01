import { Router } from "express";
import { getThumbFileById } from "../services/video/thumb";
import { getVideoDataByNid, getVideoList } from "../services/video";
import { resolve } from "path";
import _ from "lodash";

const videoRouter = Router();

videoRouter.get('/', async (req, res) => {
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

videoRouter.get('/:nid/thumb', (req, res) => {
  const { nid } = req.params;
  const file = getThumbFileById(nid);
  if (!file) {
    res.status(404).send({
      code: 404,
      msg: 'thumb not found'
    });
  } else {
    res.setHeader('Content-Type', 'image/png').send(file);
  }
})

videoRouter.get('/:nid/file', async (req, res) => {
  const { nid } = req.params;
  const video = await getVideoDataByNid(nid);
  if (video.code != 200) {
    res.send(video);
  } else {
    res.sendFile(resolve(video.data.basePath, video.data.relativePath));
  }
})

videoRouter.get('/:nid', async (req, res) => {
  const { nid } = req.params;
  res.send(await getVideoDataByNid(nid));
})

export default videoRouter;