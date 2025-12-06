import fs1 from "fs";
import fs from "fs/promises";
import crypto from "crypto";
import { pipeline } from "stream/promises";

import path from "path";
import NodeSpecificUtils from "../../../services/utils/node-specific.js";
import { logger } from "../logging.js";

const uploadsRoot = path.join(
  NodeSpecificUtils.getProjectRoot(),
  "data",
  "uploads"
);

const tempUploadsRoot = path.join(
  NodeSpecificUtils.getProjectRoot(),
  "data",
  "temp-uploads"
);

class UserFilesFolderUtils {
  getTempUploadsRoot(): string {
    return path.join(tempUploadsRoot);
  }
  getTempUploadFilePath(fileId: string): string {
    return path.join(this.getTempUploadsRoot(), fileId);
  }
  async getUserFolderPath(userId: string): Promise<string> {
    const userFolderPath = path.join(uploadsRoot, userId);
    // if not exists, create it
    const fs = await import("fs");
    if (!fs.existsSync(userFolderPath)) {
      fs.mkdirSync(userFolderPath, { recursive: true });
    }
    return userFolderPath;
  }

  async getUserDocumentFilePath(
    userId: string,
    fileId: string
  ): Promise<string> {
    return path.join(await this.getUserFolderPath(userId), fileId);
  }

  async fileAtTempLocation(tempPath: string): Promise<boolean> {
    const fs = await import("fs");
    return fs.existsSync(tempPath);
  }

  async saveDocumentToUserFolder(
    userId: string,
    fileId: string,
    sha512Hash: string
  ): Promise<{
    finalPath: string;
    success: boolean;
    errorMessage: "checksum-mismatch" | "file-not-found" | "other-error" | "";
    userFolderPath: string;
  }> {
    try {
      const finalPath = await this.getUserDocumentFilePath(userId, fileId);
      const tempPath = this.getTempUploadFilePath(fileId);

      const fileExists = await this.fileAtTempLocation(tempPath);
      if (!fileExists) {
        return {
          finalPath: "",
          success: false,
          errorMessage: "file-not-found",
          userFolderPath: await this.getUserFolderPath(userId),
        };
      }

      const sha512OfTemp = await getFileChecksumWithAwait(tempPath, "sha512");
      if (sha512OfTemp !== sha512Hash) {
        return {
          finalPath: "",
          success: false,
          errorMessage: "checksum-mismatch",
          userFolderPath: await this.getUserFolderPath(userId),
        };
      }
      // move the file from temp to final location
      const fs = await import("fs/promises");
      await fs.rename(tempPath, finalPath);
      return {
        finalPath,
        success: true,
        errorMessage: "",
        userFolderPath: await this.getUserFolderPath(userId),
      };
    } catch (error) {
      logger.moderate("Error saving document to user folder:", error);
      return {
        finalPath: "",
        success: false,
        errorMessage: "other-error",
        userFolderPath: await this.getUserFolderPath(userId),
      };
    }
  }

  async deleteUserDocumentFile(
    userId: string,
    fileId: string
  ): Promise<boolean> {
    try {
      const filePath = await this.getUserDocumentFilePath(userId, fileId);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      logger.moderate("Error deleting user document file:", error);
      return false;
    }
  }
}

export default new UserFilesFolderUtils();

/**
 * Calculates the checksum of a file efficiently using streams and async/await.
 * @param {string} filePath - The path to the file.
 * @param {string} algorithm - The hashing algorithm (e.g., 'md5', 'sha256', 'sha512').
 * @returns {Promise<string>} The calculated checksum.
 */
async function getFileChecksumWithAwait(
  filePath: string,
  algorithm = "sha512"
) {
  // 1. Create the source stream (reads file chunks)
  const source = fs1.createReadStream(filePath);
  // 2. Create the destination stream (calculates the hash)
  const hash = crypto.createHash(algorithm);

  try {
    // 3. Use 'pipeline' to connect the source to the hash destination.
    // Pipeline handles errors and closing streams automatically.
    // Awaiting this promise means all data has been processed.
    await pipeline(source, hash);

    // 4. Once the pipeline completes, the hash object has the final digest.
    // We use .digest() to get the final result as a hex string.
    return hash.digest("hex");
  } catch (error) {
    // Handle any errors that occur during reading or hashing
    console.error("Error during file processing:", error);
    throw error; // Re-throw the error for the caller to handle
  }
}
