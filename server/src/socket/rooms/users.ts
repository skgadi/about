import { getDatabase } from "../../db/initialization.js";
import {
  GSK_SC_USER_LIST_UPDATE,
  GSK_SC_USER_PUBLIC_DETAILS_UPDATE,
  GSK_SC_USER_SELF_DETAILS_UPDATE,
} from "../../services/library/types/data-transfer/users.js";
import {
  GSK_USER_DB,
  GSK_USER_PUBLIC_DETAILS,
  GSK_USER_PUBLIC_SUMMARY,
} from "../../services/library/types/structures/users.js";
import { logger } from "../../services/utils/logging.js";
import {
  dbToJsonUserPublicDetails,
  dbToJsonUserSelf,
  dbToJsonUsersSummary,
} from "../../services/utils/users/db-json.js";
import { Server, Socket } from "socket.io";

class usersRoomRoutines {
  private io: Server | null = null;
  private db = getDatabase();

  initialize(ioInstance: Server) {
    this.io = ioInstance;
  }

  joinUsersListRoom(socket: Socket) {
    socket.join("users-list-room");
    this.emitUsersListUpdate(socket);
  }

  joinUserDetailsPublicRoom(socket: Socket, userId: string) {
    // Leave any existing public details rooms
    this.leaveUserDetailsPublicRoom(socket);
    socket.join(`user-details-public-room-${userId}`);
    this.emitUserPublicDetailsUpdate(socket, userId);
  }
  leaveUserDetailsPublicRoom(socket: Socket) {
    const rooms = Array.from(socket.rooms);
    rooms.forEach((room) => {
      if (room.startsWith("user-details-public-room-")) {
        socket.leave(room);
      }
    });
  }

  joinUserDetailsSelfRoom(socket: Socket, userId: string) {
    // Leave any existing self details rooms
    this.leaveUserDetailsSelfRoom(socket);
    socket.join(`user-details-self-room-${userId}`);
    this.emitUserSelfDetailsUpdate(socket, userId);
  }
  leaveUserDetailsSelfRoom(socket: Socket) {
    const rooms = Array.from(socket.rooms);
    rooms.forEach((room) => {
      if (room.startsWith("user-details-self-room-")) {
        socket.leave(room);
      }
    });
  }

  emitUsersListUpdate(
    socket: Socket | null = null,
    userId: string | null = null
  ) {
    if (!this.db) {
      logger.critical("Database not initialized in usersRoomRoutines");
      return;
    }
    if (!this.io) {
      logger.critical(
        "Socket.io instance not initialized in usersRoomRoutines"
      );
      return;
    }
    const listOfUsers: GSK_USER_DB[] = [];

    // Fetch users from the database
    if (userId) {
      const user = this.db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(userId);
      if (user) {
        listOfUsers.push(user);
      }
    } else {
      const users = this.db.prepare("SELECT * FROM users").all();
      users.forEach((user: GSK_USER_DB) => {
        listOfUsers.push(user);
      });
    }

    // Convert to public summary format
    const usersSummary: GSK_USER_PUBLIC_SUMMARY[] =
      dbToJsonUsersSummary(listOfUsers);
    const payload: GSK_SC_USER_LIST_UPDATE = {
      id: "GSK_SC_USER_LIST_UPDATE",
      payload: {
        usersList: usersSummary,
      },
    };

    // Emit to specific socket or broadcast to room
    if (socket) {
      socket.emit("GSK_SC_USER_LIST_UPDATE", payload);
    } else {
      this.io.to("users-list-room").emit("GSK_SC_USER_LIST_UPDATE", payload);
    }
  }

  emitUserPublicDetailsUpdate(socket: Socket | null = null, userId: string) {
    if (!this.db) {
      logger.critical("Database not initialized in usersRoomRoutines");
      return;
    }
    if (!this.io) {
      logger.critical(
        "Socket.io instance not initialized in usersRoomRoutines"
      );
      return;
    }
    const user: GSK_USER_DB = this.db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(userId);
    if (!user) {
      logger.moderate(
        `User with ID ${userId} not found for public details update.`
      );
      return;
    }

    const userPublicDetails: GSK_USER_PUBLIC_DETAILS =
      dbToJsonUserPublicDetails(user);
    const payload: GSK_SC_USER_PUBLIC_DETAILS_UPDATE = {
      id: "GSK_SC_USER_PUBLIC_DETAILS_UPDATE",
      payload: {
        userPublicDetails,
      },
    };

    // Emit to specific socket or broadcast to room
    if (socket) {
      socket.emit("GSK_SC_USER_PUBLIC_DETAILS_UPDATE", payload);
    } else {
      this.io
        .to(`user-details-public-room-${userId}`)
        .emit("GSK_SC_USER_PUBLIC_DETAILS_UPDATE", payload);
    }
  }

  emitUserSelfDetailsUpdate(socket: Socket | null = null, userId: string) {
    if (!this.db) {
      logger.critical("Database not initialized in usersRoomRoutines");
      return;
    }
    if (!this.io) {
      logger.critical(
        "Socket.io instance not initialized in usersRoomRoutines"
      );
      return;
    }
    const user: GSK_USER_DB = this.db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(userId);
    if (!user) {
      logger.moderate(
        `User with ID ${userId} not found for self details update.`
      );
      return;
    }

    const userSelfDetails = dbToJsonUserSelf(user);
    const payload: GSK_SC_USER_SELF_DETAILS_UPDATE = {
      id: "GSK_SC_USER_SELF_DETAILS_UPDATE",
      payload: {
        userSelfDetails: userSelfDetails,
      },
    };

    // Emit to specific socket or broadcast to room
    if (socket) {
      socket.emit("GSK_SC_USER_SELF_DETAILS_UPDATE", payload);
    } else {
      this.io
        .to(`user-details-self-room-${userId}`)
        .emit("GSK_SC_USER_SELF_DETAILS_UPDATE", payload);
    }
  }

  emitUserEveryWhere(userId: string) {
    this.emitUsersListUpdate(null, userId);
    this.emitUserPublicDetailsUpdate(null, userId);
    this.emitUserSelfDetailsUpdate(null, userId);
  }
}

export const usersRoom = new usersRoomRoutines();
