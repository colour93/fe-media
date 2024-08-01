import { resolve } from "path";
import Config from "../typings/config";
import { existsSync, readFileSync } from "fs";

export const config = JSON.parse(readFileSync(resolve('data', 'config.json')).toString()) as Config;

if (!existsSync(config.data.basePath)) throw new Error('Base Path is not exists.');