import { Router } from "express";
import manageTagRouter from "./tag";
import manageVideoRouter from "./video";

const manageRouter = Router();

manageRouter.use('/video', manageVideoRouter);

manageRouter.use('/tag', manageTagRouter);

export default manageRouter;