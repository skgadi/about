import {
  GSK_CS_USER_LIST_REQUEST,
  GSK_CS_USER_PUBLIC_DETAILS_REQUEST,
  GSK_CS_USER_SELF_DETAILS_REQUEST,
} from "../../services/library/types/data-transfer/users.js";
import { notifyErrorToClient } from "../../services/utils/notificatons-to-client.js";
import { signedInStore } from "../../socket/payloads/signed-in-db.js";
import { usersRoom } from "../../socket/rooms/users.js";

export const routines = (io: any, socket: any) => {
  socket.on(
    "GSK_CS_USER_LIST_REQUEST",
    async (data: GSK_CS_USER_LIST_REQUEST) => {
      usersRoom.joinUsersListRoom(socket);
    }
  );

  socket.on(
    "GSK_CS_USER_PUBLIC_DETAILS_REQUEST",
    async (data: GSK_CS_USER_PUBLIC_DETAILS_REQUEST) => {
      const { userId } = data.payload;
      usersRoom.joinUserDetailsPublicRoom(socket, userId);
    }
  );

  socket.on(
    "GSK_CS_USER_SELF_DETAILS_REQUEST",
    async (data: GSK_CS_USER_SELF_DETAILS_REQUEST) => {
      const { userId } = data.payload;
      if (
        !signedInStore.isAuthorizedToEditBasicUserRecords(socket.id, userId)
      ) {
        notifyErrorToClient(
          socket,
          "User Self Details Error",
          "You are not authorized to access self details for this user."
        );
        return;
      }
      usersRoom.joinUserDetailsSelfRoom(socket, userId);
    }
  );
};
