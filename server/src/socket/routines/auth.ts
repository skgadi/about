import { GSK_SC_NOTIFICATION } from "../../services/library/types/data-transfer/notifications.js";
import { getDatabase } from "../../db/initialization.js";
import {
  GSK_CS_AUTH_SIGN_IN,
  GSK_CS_AUTH_SIGN_OUT,
  GSK_SC_AUTH_SIGN_IN_SUCCESS,
  GSK_SC_AUTH_SIGN_OUT_SUCCESS,
} from "../../services/library/types/data-transfer/auth.js";
import { logger } from "../../services/utils/logging.js";
import {
  notifyErrorToClient,
  notifySuccessToClient,
} from "../../services/utils/notificatons-to-client.js";
import { compareSync } from "bcrypt";
import { signedInStore } from "../../socket/payloads/signed-in-db.js";
import {
  dbToJsonUserSelf,
  dbToJsonUserServerSummary,
} from "../../services/utils/users/db-json.js";
import { GSK_USER_SELF_DETAILS } from "../../services/library/types/structures/users.js";
import { usersRoom } from "../../socket/rooms/users.js";

export const routines = (io: any, socket: any) => {
  socket.on("GSK_CS_AUTH_SIGN_IN", async (data: GSK_CS_AUTH_SIGN_IN) => {
    try {
      const { email, password } = data.payload;
      // test if email exists in the database.
      const db = getDatabase();

      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      logger.verbose(`Attempting to authenticate user with email: ${email}`);
      if (!user) {
        notifyErrorToClient(
          socket,
          "Authentication Failed",
          "email not found."
        );
        return;
      }

      const isPasswordValid = compareSync(password, user.passwordHash);
      if (!isPasswordValid) {
        notifyErrorToClient(
          socket,
          "Authentication Failed",
          "Invalid password."
        );
        return;
      }

      // Authentication successful
      logger.verbose(`User ${email} authenticated successfully.`);

      // Check if the user is already signed in
      const existingSocket = signedInStore.getSocketByUserId(user.id);
      if (existingSocket) {
        const signedOutPayload: GSK_SC_AUTH_SIGN_OUT_SUCCESS = {
          id: "GSK_SC_AUTH_SIGN_OUT_SUCCESS",
          payload: {},
        };
        existingSocket.emit("GSK_SC_AUTH_SIGN_OUT_SUCCESS", signedOutPayload);
        logger.verbose(`User ${email} was signed out from previous session.`);
      }

      // Emit success event with user details (excluding sensitive info)
      const userSelfDetails: GSK_USER_SELF_DETAILS = dbToJsonUserSelf(user);

      const payload: GSK_SC_AUTH_SIGN_IN_SUCCESS = {
        id: "GSK_SC_AUTH_SIGN_IN_SUCCESS",
        payload: {
          user: userSelfDetails,
        },
      };
      const userSummary = dbToJsonUserServerSummary(user);
      const isCompleteSuccessInSignOutAndSignIn =
        signedInStore.signOutOthersAndSignIn(socket.id, userSummary);
      if (!isCompleteSuccessInSignOutAndSignIn) {
        notifyErrorToClient(
          socket,
          "Authentication Failed",
          "Could not sign in user due to an internal error."
        );
        return;
      }

      socket.emit("GSK_SC_AUTH_SIGN_IN_SUCCESS", payload);
      logger.verbose(`User ${email} signed in on socket ${socket.id}.`);

      usersRoom.joinUserDetailsSelfRoom(socket, user.id);
      notifySuccessToClient(
        socket,
        "Authentication Successful",
        `Welcome back, ${
          userSelfDetails.displayName || userSelfDetails.names[0] || "User"
        }!`
      );
    } catch (error) {
      logger.critical("Error during authentication:", error);
    }
  });

  socket.on("GSK_CS_AUTH_SIGN_OUT", async (data: GSK_CS_AUTH_SIGN_OUT) => {
    try {
      const userId = signedInStore.getUserBySocketId(socket.id);
      if (!userId) {
        notifyErrorToClient(
          socket,
          "Sign Out Failed",
          "No user is currently signed in on this socket."
        );
        return;
      }

      const isSignedOut = signedInStore.signOut(socket.id);
      if (!isSignedOut) {
        notifyErrorToClient(
          socket,
          "Sign Out Failed",
          "Could not sign out user due to an internal error."
        );
        return;
      }

      usersRoom.leaveUserDetailsSelfRoom(socket);
      const payload: GSK_SC_AUTH_SIGN_OUT_SUCCESS = {
        id: "GSK_SC_AUTH_SIGN_OUT_SUCCESS",
        payload: {},
      };
      socket.emit("GSK_SC_AUTH_SIGN_OUT_SUCCESS", payload);

      notifySuccessToClient(
        socket,
        "Sign Out Successful",
        "You have been signed out successfully."
      );

      logger.verbose(
        `User with ID ${userId} signed out from socket ${socket.id}.`
      );
    } catch (error) {
      logger.critical("Error during sign out:", error);
    }
  });
};
