import { signedInStore } from "./signed-in-db.js";

export const init = (io: any) => {
  signedInStore.initialize(io);
};
