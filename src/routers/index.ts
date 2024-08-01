import { Router } from "express";
import videoRouter from "./video";
import manageRouter from "./manage";
import tagRouter from "./tag";

const apiRouter = Router();

apiRouter.use('/video', videoRouter);

apiRouter.use('/tag', tagRouter);

apiRouter.use('/manage', manageRouter);

export default apiRouter;