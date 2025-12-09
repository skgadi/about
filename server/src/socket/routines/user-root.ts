import { logger } from "../../services/utils/logging.js";
import { getDatabase } from "../../db/initialization.js";
import {
  GSK_CS_USER_ROOT_FIELD,
  GSK_CS_USER_ROOT_PIC,
} from "../../services/library/types/data-transfer/user-root.js";
import { GSK_USER_LOG } from "../../services/library/types/structures/users.js";
import { notifyErrorToClient } from "../../services/utils/notificatons-to-client.js";
import { signedInStore } from "../../socket/payloads/signed-in-db.js";
import { usersRoom } from "../../socket/rooms/users.js";

export const routines = (io: any, socket: any) => {
  socket.on("GSK_CS_USER_ROOT_PIC", async (data: GSK_CS_USER_ROOT_PIC) => {
    try {
      const { userId, avatarUrl } = data.payload;
      // Check if the socket is authorized to update this user's root pic
      if (
        !signedInStore.isAuthorizedToEditBasicUserRecords(socket.id, userId)
      ) {
        notifyErrorToClient(
          socket,
          "User Root PIC Error",
          "You are not authorized to update the root picture for this user."
        );
        return;
      }

      const db = getDatabase();
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (!user) {
        notifyErrorToClient(socket, "User Root PIC Error", "User not found.");
        return;
      }
      const log: GSK_USER_LOG = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        action: "user_profile_updated",

        metadata: {
          description: "User root picture updated.",
        },
        userId: userId,
      };
      // update the existing log
      user.log = user.log ? (JSON.parse(user.log) as GSK_USER_LOG[]) : [];
      user.log.push(log);
      const updatedLogs = JSON.stringify(user.log);
      // Update the user's root picture URL and logs in the database
      db.prepare("UPDATE users SET avatarUrl = ?, log = ? WHERE id = ?").run(
        avatarUrl,
        updatedLogs,
        userId
      );
      usersRoom.emitUserEveryWhere(userId);
    } catch (error) {
      notifyErrorToClient(
        socket,
        "User Root PIC Error",
        "An error occurred while processing your request."
      );
      logger.critical("Error handling GSK_CS_USER_ROOT_PIC:", error);
    }
  });
  socket.on("GSK_CS_USER_ROOT_FIELD", async (data: GSK_CS_USER_ROOT_FIELD) => {
    try {
      const { userId, fieldName, fieldValue } = data.payload;
      // Check if the socket is authorized to update this user's root field
      if (
        !signedInStore.isAuthorizedToEditBasicUserRecords(socket.id, userId)
      ) {
        notifyErrorToClient(
          socket,
          "User Root Field Error",
          "You are not authorized to update the root field for this user."
        );
        return;
      }

      const db = getDatabase();
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (!user) {
        notifyErrorToClient(socket, "User Root Field Error", "User not found.");
        return;
      }
      const log: GSK_USER_LOG = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        action: "user_profile_updated",
        metadata: {
          description: `User root field '${fieldName}' updated.`,
        },
        userId: userId,
      };
      // update the existing log
      user.log = user.log ? (JSON.parse(user.log) as GSK_USER_LOG[]) : [];
      user.log.push(log);
      const updatedLogs = JSON.stringify(user.log);
      // Update the specified root field and logs in the database
      const updateQuery = `UPDATE users SET ${fieldName} = ?, log = ? WHERE id = ?`;
      db.prepare(updateQuery).run(fieldValue, updatedLogs, userId);
      usersRoom.emitUserEveryWhere(userId);
    } catch (error) {
      logger.critical("Error handling GSK_CS_USER_ROOT_FIELD:", error);
      notifyErrorToClient(
        socket,
        "User Root Field Error",
        "An error occurred while processing your request."
      );
    }
  });
};
