import { createTables } from "./db/create-tables.js";
import { startStaticServerWithSocket } from "./main-static-server.js";

startStaticServerWithSocket();

createTables();
