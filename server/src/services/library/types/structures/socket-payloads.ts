import { GSK_USER_SERVER_SUMMARY } from "./users.js";

export interface GSK_SOCKET_PAYLOAD_SIGNED_IN_DB {
  socketId: string;
  user: GSK_USER_SERVER_SUMMARY;
}
