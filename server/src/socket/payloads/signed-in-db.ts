// signed-in-store.ts
import { Server, Socket } from "socket.io";
import { GSK_SOCKET_PAYLOAD_SIGNED_IN_DB } from "../../services/library/types/structures/socket-payloads.js";

type User = GSK_SOCKET_PAYLOAD_SIGNED_IN_DB["user"];

/**
 * This store enforces a single login per user.
 * Maps: userId -> socketId, socketId -> user
 */
class SignedInStore {
  private io: Server | null = null;
  private userToSocket = new Map<string, string>();
  private socketToUser = new Map<string, User>();

  initialize(ioInstance: Server) {
    this.io = ioInstance;
  }

  /** Sign in user. Returns true if successful, false if the user is already logged in elsewhere */
  signIn(socketId: string, user: User): boolean {
    // User already logged somewhere else?
    if (this.userToSocket.has(user.id)) return false;

    this.userToSocket.set(user.id, socketId);
    this.socketToUser.set(socketId, user);

    return true;
  }

  /** Sign out by socket ID */
  signOut(socketId: string): boolean {
    if (!this.socketToUser.has(socketId)) return false;

    const user = this.socketToUser.get(socketId)!;
    this.socketToUser.delete(socketId);
    this.userToSocket.delete(user.id);

    return true;
  }

  /** When socket is disconencted */
  handleSocketDisconnection(socketId: string) {
    this.signOut(socketId);
  }

  /** Force sign out on other sockets, then sign in here */
  signOutOthersAndSignIn(socketId: string, user: User): boolean {
    const previousSocket = this.userToSocket.get(user.id);

    if (previousSocket) {
      this.signOut(previousSocket);
    }

    return this.signIn(socketId, user);
  }

  /** Get user by socket ID */
  getUserBySocketId(socketId: string): User | null {
    return this.socketToUser.get(socketId) || null;
  }

  /** Get socket ID by user ID */
  getSocketIdByUserId(userId: string): string | null {
    return this.userToSocket.get(userId) || null;
  }

  /** Get Socket.IO socket instance */
  getSocketById(socketId: string): Socket | null {
    if (!this.io) return null;
    return this.io.sockets.sockets.get(socketId) || null;
  }

  /** Get socket by user ID */
  getSocketByUserId(userId: string): Socket | null {
    const sid = this.getSocketIdByUserId(userId);
    return sid ? this.getSocketById(sid) : null;
  }

  /** Check if socket is signed in */
  isSignedIn(socketId: string): boolean {
    return this.socketToUser.has(socketId);
  }

  /** List all signed-in users */
  getAllUsers(): User[] {
    return Array.from(this.socketToUser.values());
  }

  /** Clear everything */
  clear() {
    this.userToSocket.clear();
    this.socketToUser.clear();
  }

  /** Get if a user is authorized to edit given userId
   * Only basic user records are considered here.
   * The details related to payment is not considered here.
   * A user can edit their own record, or if they are admin/superadmin
   *
   *
   * @param socketId Socket ID of the signed-in user
   * @param userId User ID of the record to edit
   * @returns boolean indicating if authorized
   */
  isAuthorizedToEditBasicUserRecords(
    socketId: string,
    userId: string
  ): boolean {
    const user = this.getUserBySocketId(socketId);
    if (!user) return false;
    // if user is the same as userId, or is admin/superadmin
    return user.id === userId || user.isAdmin || user.isSuperAdmin;
  }
}

// Singleton instance of the store
export const signedInStore = new SignedInStore();
