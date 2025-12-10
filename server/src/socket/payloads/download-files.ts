import { getDatabase } from "../../db/initialization.js";
import { GSK_USER_DETAILS } from "../../services/library/types/structures/users.js";
import { logger } from "../../services/utils/logging.js";
import { signedInStore } from "./signed-in-db.js";

export const isAValidDownloadRequest = async (
  userId: string,
  fileId: string,
  mySocketId: string
) => {
  try {
    // get the file detials from the database
    const db = getDatabase();
    const userDetails = await db
      .prepare(`SELECT details FROM users WHERE id = ?`)
      .get(userId);
    if (!userDetails) {
      logger.critical(`User with id ${userId} not found.`);
      return "";
    }
    const userDetailsJson = JSON.parse(userDetails.details) as GSK_USER_DETAILS;
    const selectedDocument = userDetailsJson.documents?.find(
      (doc) => doc.id === fileId
    );
    if (!selectedDocument) {
      logger.critical(
        `Document with id ${fileId} not found for user ${userId}.`
      );
      return "";
    }
    // check if the document is available for public download
    const isPublic = selectedDocument.metaInfo?.isPublic ?? false;
    // if not public, then we should see if the user has access to it
    if (!isPublic) {
      const isAdmin = signedInStore.isAuthorizedToEditBasicUserRecords(
        mySocketId,
        userId
      );
      if (!isAdmin) {
        logger.critical(
          `User with socket id ${mySocketId} is not authorized to download document ${fileId} of user ${userId}.`
        );
        return "";
      }
    }
    return selectedDocument.originalName + "." + selectedDocument.extension;
  } catch (error) {
    logger.critical(`Error in downloadAFileRequest: ${error}`);
    return "";
  }
};
