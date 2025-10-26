import fs from "fs/promises";
import path from "path";

/**
 * Writes content to a file, creating directories if needed
 * @param {string} filePath - Full path to the file
 * @param {string} content - Content to write
 */
export const writeFile = async (filePath: string, content: string) => {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, "utf-8");
};

/**
 * Deletes a file
 * @param {string} filePath - Full path to the file
 */
export const deleteFile = async (filePath: string) => {
  await fs.unlink(filePath);
};

/**
 * Reads a file and returns its content
 * @param {string} filePath - Full path to the file
 * @returns {Promise<string>} - File content
 */
export const readFile = async (filePath: string): Promise<string> => {
  return await fs.readFile(filePath, "utf-8");
};

/**
 * Checks if a file exists
 * @param {string} filePath - Full path to the file
 * @returns {Promise<boolean>}
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};
