import { DataSourceOptions } from "typeorm";


export default interface Config {
  db: DataSourceOptions;
  data: {
    basePath: string;
    thumbPath: string;
  }
}