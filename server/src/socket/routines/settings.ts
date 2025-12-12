import { getDatabase } from "../../db/initialization.js";
import { GSK_CS_UPDATE_USER_SETTING } from "../../services/library/types/data-transfer/settings.js";
import { logger } from "../../services/utils/logging.js";
import { notifyErrorToClient } from "../../services/utils/notificatons-to-client.js";
import { signedInStore } from "../../socket/payloads/signed-in-db.js";
import { usersRoom } from "../../socket/rooms/users.js";

export const routines = (io: any, socket: any) => {
  socket.on(
    "GSK_CS_UPDATE_USER_SETTING",
    async (data: GSK_CS_UPDATE_USER_SETTING) => {
      try {
        const { userId, settings } = data.payload;
        if (
          !signedInStore.isAuthorizedToEditBasicUserRecords(socket.id, userId)
        ) {
          notifyErrorToClient(
            socket,
            "User Settings Update Error",
            "You are not authorized to update settings for this user."
          );
          return;
        }

        const db = getDatabase();

        // check if the user exists
        const userRecord = db
          .prepare("SELECT * FROM users WHERE id = ?")
          .get(userId);
        if (!userRecord) {
          notifyErrorToClient(
            socket,
            "User Settings Update Error",
            "The specified user does not exist."
          );
          return;
        }

        db.prepare("UPDATE users SET settings = ? WHERE id = ?").run(
          JSON.stringify(settings),
          userId
        );

        usersRoom.emitUserEveryWhere(userId);
      } catch (error) {
        logger.critical("Error handling GSK_CS_UPDATE_USER_SETTING:", error);
        notifyErrorToClient(
          socket,
          "User Settings Update Error",
          "An error occurred while updating user settings."
        );
      }
    }
  );
};
