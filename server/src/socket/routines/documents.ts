import { notifyErrorToClient } from "services/utils/notificatons-to-client.js";
import { GSK_CS_DOCUMENT_UPLOAD_REQUEST } from "../../services/library/types/data-transfer/documents.js";
import { signedInStore } from "../../socket/payloads/signed-in-db.js";
import { getDatabase } from "../../db/initialization.js";
import {
  dbToJsonUserPublicDetails,
  dbToJsonUserSelf,
  jsonToDbUser,
} from "../../services/utils/users/db-json.js";
import {
  GSK_DOCUMENT,
  GSK_USER,
  GSK_USER_DB,
  GSK_USER_DETAILS,
  GSK_USER_LOG,
} from "../../services/library/types/structures/users.js";
import filesFolder from "services/utils/users/files-folder.js";
import { usersRoom } from "socket/rooms/users.js";

export const routines = (io: any, socket: any) => {
  socket.on(
    "GSK_CS_DOCUMENT_UPLOAD_REQUEST",
    async (data: GSK_CS_DOCUMENT_UPLOAD_REQUEST) => {
      try {
        const { fileMeta, fileId, userId } = data.payload;
        // Check if the userId matches the socket's authenticated user
        if (
          !signedInStore.isAuthorizedToEditBasicUserRecords(socket.id, userId)
        ) {
          notifyErrorToClient(
            socket,
            "Document Upload Error",
            "You are not authorized to upload documents for this user."
          );
          return;
        }
        // Obtain the user details from DB
        const db = getDatabase();
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
        if (!user) {
          notifyErrorToClient(
            socket,
            "Document Upload Error",
            "User not found."
          );
          return;
        }

        const userData = dbToJsonUserSelf(user);

        // check if the document already exists in the present user's documents
        const documentExists = userData.details?.documents?.some(
          (doc) => doc.checksumSHA512 === fileMeta.sha512Hash
        );
        if (documentExists) {
          notifyErrorToClient(
            socket,
            "Document Upload Error",
            "Document already exists."
          );
          return;
        }

        // Move the file from temp storage to user's document folder
        const { finalPath, success, errorMessage, userFolderPath } =
          await filesFolder.saveDocumentToUserFolder(
            userId,
            fileId,
            fileMeta.sha512Hash
          );

        if (!success) {
          notifyErrorToClient(
            socket,
            "Document Upload Error",
            `Failed to save document: ${errorMessage}`
          );
          return;
        }
        try {
          const newDocument: GSK_DOCUMENT = {
            id: fileId,
            originalName: fileMeta.fileName,
            mimeType: fileMeta.mimeType,
            sizeBytes: fileMeta.sizeInBytes,
            checksumSHA512: fileMeta.sha512Hash,
            uploadedAt: new Date().toISOString(),
            extension: fileMeta.extension,
            metaInfo: {},
            serverFileName: finalPath,
            serverFilePath: userFolderPath,
          };

          // Update the user's document list in the database
          const updatedDocuments = userData.details?.documents
            ? [...userData.details.documents, newDocument]
            : [newDocument];

          // Prepare log element
          const logElement: GSK_USER_LOG = {
            id: `log_${Date.now()}`,
            action: "document_created",
            timestamp: new Date().toISOString(),
            userId: userId,
            ipAddress: socket.handshake.address,
            location: socket.handshake.headers["x-location"] || "unknown",
          };

          // Update the log
          userData.log.push(logElement);

          const updatedDetails: GSK_USER_DETAILS = {
            ...userData.details,
            documents: updatedDocuments,
          };
          // update the userData details
          userData.details = updatedDetails;

          const userDbCompatible: GSK_USER_DB = jsonToDbUser(userData);

          db.prepare(`UPDATE users SET details = ?, log = ? WHERE id = ?`).run(
            userDbCompatible.details,
            userDbCompatible.log,
            userId
          );

          // Update the user details and log in the database
          usersRoom.emitUserSelfDetailsUpdate(null, userId);
        } catch (error) {
          await filesFolder.deleteUserDocumentFile(userId, fileId);
        }
      } catch (error) {
        notifyErrorToClient(
          socket,
          "Document Upload Error",
          "An error occurred during document upload."
        );
      }
    }
  );
};
