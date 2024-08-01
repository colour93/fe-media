import { DataSource } from "typeorm"
import { config } from "./utils/preload";

export const dataSource = new DataSource(config.db);