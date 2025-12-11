import { getDatabase } from "../../db/initialization.js";
import { GSK_CS_META_INFO_UPDATE_A_FIELD } from "../../services/library/types/data-transfer/meta-info.js";
import { GSK_USER_LOG } from "../../services/library/types/structures/users.js";
import { logger } from "../../services/utils/logging.js";
import {
  notifyErrorToClient,
  notifySuccessToClient,
} from "../../services/utils/notificatons-to-client.js";
import {
  dbToJsonUserSelf,
  jsonToDbUser,
} from "../../services/utils/users/db-json.js";
import { signedInStore } from "../../socket/payloads/signed-in-db.js";
import { usersRoom } from "../../socket/rooms/users.js";

export const routines = (io: any, socket: any) => {
  socket.on(
    "GSK_CS_META_INFO_UPDATE_A_FIELD",
    async (data: GSK_CS_META_INFO_UPDATE_A_FIELD) => {
      try {
        const { elementType, elementId, userId, fieldName, newValue } =
          data.payload;
        if (
          !signedInStore.isAuthorizedToEditBasicUserRecords(socket.id, userId)
        ) {
          notifyErrorToClient(
            socket,
            "Meta Info Update Error",
            "You are not authorized to update meta info for this user."
          );
          return;
        }

        // get the database connection
        const db = getDatabase();
        // get the user details
        const userRecord = db
          .prepare("SELECT * FROM users WHERE id = ?")
          .get(userId);
        if (!userRecord) {
          notifyErrorToClient(
            socket,
            "Meta Info Update Error",
            "User not found."
          );
          return;
        }
        const user = dbToJsonUserSelf(userRecord);
        const element = user.details?.[elementType]?.find(
          (el) => el.id === elementId
        );
        if (!element) {
          notifyErrorToClient(
            socket,
            "Meta Info Update Error",
            `Element of type ${elementType} with id ${elementId} not found.`
          );
          return;
        }
        // update the field
        if (!element.metaInfo) {
          element.metaInfo = {};
        }
        (element.metaInfo as any)[fieldName] = newValue;

        // save the updated user details back to the database
        const updatedDetails = JSON.stringify(user.details);

        db.prepare("UPDATE users SET details = ? WHERE id = ?").run(
          updatedDetails,
          userId
        );

        usersRoom.emitUserEveryWhere(userId);
      } catch (error) {
        logger.critical(`Error in GSK_CS_META_INFO_UPDATE_A_FIELD: ${error}`);
        notifyErrorToClient(
          socket,
          "Meta Info Update Error",
          "An error occurred while updating meta info."
        );
      }
    }
  );
};
