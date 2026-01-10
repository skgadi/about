import { logger } from "../../services/utils/logging.js";
import { listAvailableModels } from "../../ai/models.js";
import {
  GSK_CS_AI_REQUEST_AVAILABLE_MODELS,
  GSK_CS_AI_REQUEST_GEN_DETAILS_FOR_DOC,
  GSK_SC_AI_AVAILABLE_MODELS,
} from "../../services/library/types/data-transfer/ai.js";
import { notifyErrorToClient } from "../../services/utils/notificatons-to-client.js";
import { signedInStore } from "../../socket/payloads/signed-in-db.js";
import { getDatabase } from "../../db/initialization.js";
import { dbToJsonUserSelf } from "../../services/utils/users/db-json.js";
import { getSummaryOfAiDoc } from "../../ai/docs.js";
import { usersRoom } from "../../socket/rooms/users.js";
import {
  GSK_DOCUMENT,
  GSK_META_INFO,
} from "../../services/library/types/structures/users.js";
import {
  generateAllDocumentMetaInfo,
  generateContributions,
  generateDocumentMainMetaInfo,
  generateSkillsAndNotes,
  generateValidationAuthorities,
} from "../../ai/docs-gen-meta.js";

export const routines = (io: any, socket: any) => {
  socket.on(
    "GSK_CS_AI_REQUEST_AVAILABLE_MODELS",
    async (inData: GSK_CS_AI_REQUEST_AVAILABLE_MODELS) => {
      try {
        const availableModels = listAvailableModels();

        const responsePayload: GSK_SC_AI_AVAILABLE_MODELS = {
          id: "GSK_SC_AI_AVAILABLE_MODELS",
          payload: {
            models: availableModels,
          },
        };

        socket.emit("GSK_SC_AI_AVAILABLE_MODELS", responsePayload);
      } catch (error) {
        notifyErrorToClient(
          socket,
          "AI Model Retrieval Error",
          "An error occurred while retrieving available AI models."
        );
        logger.critical(
          "Error handling GSK_CS_AI_REQUEST_AVAILABLE_MODELS:",
          error
        );
      }
    }
  );
  socket.on(
    "GSK_CS_AI_REQUEST_GEN_DETAILS_FOR_DOC",
    async (inData: GSK_CS_AI_REQUEST_GEN_DETAILS_FOR_DOC) => {
      try {
        const { documentId, userId, level, indexes } = inData.payload;
        // check if the user has authorization to manipulate this document
        if (
          !signedInStore.isAuthorizedToEditBasicUserRecords(socket.id, userId)
        ) {
          notifyErrorToClient(
            socket,
            "AI Document Details Error",
            "You are not authorized to access details for this document."
          );
          logger.critical(
            `Unauthorized access attempt by socket ${socket.id} for user ${userId} document ${documentId}`
          );
          return;
        }

        const db = getDatabase();

        // find the uploaded doc
        const userDetails = db
          .prepare("SELECT * FROM users WHERE id = ?")
          .get(userId);
        if (!userDetails) {
          notifyErrorToClient(
            socket,
            "AI Document Details Error",
            "User not found."
          );
          return;
        }
        const userData = dbToJsonUserSelf(userDetails);
        const document = userData.details?.documents?.find(
          (doc) => doc.id === documentId
        );
        if (!document) {
          notifyErrorToClient(
            socket,
            "AI Document Details Error",
            "Document not found."
          );
          return;
        }
        const userName =
          userData.displayName ||
          (userData.names.length > 0 ? userData.names[0] : userData.email);

        //let aiResponse: GSK_META_INFO | null = null;

        switch (level) {
          case "all":
            await generateAllDocumentMetaInfo(
              socket,
              userId,
              document,
              userName,
              userData.names
            );
            break;
          case "summary":
            await generateDocumentMainMetaInfo(socket, userId, document);
            break;
          case "skills":
            await generateSkillsAndNotes(
              socket,
              userId,
              document,
              userName,
              userData.names,
              indexes[0] || 0
            );
            break;
          case "validation":
            await generateValidationAuthorities(
              socket,
              userId,
              document,
              userName,
              userData.names
            );
            break;
          case "roles":
            await generateContributions(
              socket,
              userId,
              document,
              userName,
              userData.names
            );
            break;
        }

        db.transaction(() => {
          // transaction is required to ensure data integrity
          const userDataDB = db
            .prepare("SELECT * FROM users WHERE id = ?")
            .get(userId); // lock the user row
          const userData = dbToJsonUserSelf(userDataDB);
          if (!userData.details?.documents) {
            throw new Error("User documents not found during update.");
          }

          const docIdx = userData?.details?.documents?.findIndex(
            (doc) => doc.id === documentId
          );
          if (docIdx < 0) {
            throw new Error("Document not found during update.");
          }
          userData.details.documents[docIdx].metaInfo = document.metaInfo;

          // Update the meta info of the document in the database
          db.prepare("UPDATE users SET details = ? WHERE id = ?").run(
            JSON.stringify(userData.details),
            userId
          );
        })();

        usersRoom.emitUserEveryWhere(userId);
      } catch (error) {
        notifyErrorToClient(
          socket,
          "AI Document Details Error",
          "An error occurred while retrieving AI document details."
        );
        logger.critical(
          "Error handling GSK_CS_AI_REQUEST_GEN_DETAILS_FOR_DOC:",
          error
        );
      }
    }
  );
};
