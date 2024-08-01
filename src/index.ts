import express from "express";
import { dataSource } from "./app-data-source";
import { preprocessVideoFiles } from "./preload/db";
import apiRouter from "./routers";
import { startFileListener } from "./listeners/file";

dataSource
  .initialize()
  .then(() => {
    console.log("Data Source has been initialized!")
    preprocessVideoFiles();
    startFileListener();
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err)
  })

const app = express();

app.use(express.json());

app.use('/api/v1', apiRouter);

app.listen(24939);