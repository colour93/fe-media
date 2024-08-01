import { createReadStream, readdirSync } from "fs";
import { join, resolve } from "path";

interface FilePath {
  relativePath: string;
  absolutePath: string;
  filename: string;
}

export const getAllFiles = (folderPath: string, basePath: string = ''): FilePath[] => {
  const entries = readdirSync(folderPath, { withFileTypes: true });
  const fileRecords: FilePath[] = [];

  for (const entry of entries) {
    const relativePath = join(basePath, entry.name);
    const absolutePath = resolve(folderPath, entry.name);
    const filename = entry.name;

    if (entry.isFile()) {
      fileRecords.push({ relativePath, absolutePath, filename });
    } else if (entry.isDirectory()) {
      const subFolderRecords = getAllFiles(absolutePath, relativePath);
      fileRecords.push(...subFolderRecords);
    }
  }

  return fileRecords;
}

export const isFileReady = (filePath: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);

    stream.on('data', () => { });
    stream.on('end', () => { resolve(true) });
    stream.on('error', (err) => reject(err));
  });
}

export const waitForFileToUnlock = async (filePath: string, retries: number = 10, delay: number = 2000) => {
  return new Promise((resolve) => {
    const attempt = async () => {
      try {
        if (retries === 0) resolve(false);
        await isFileReady(filePath);
        resolve(true);
      } catch (error) {
        setTimeout(() => attempt(), delay);
        retries--;
      }
    }
    attempt();
  });
}