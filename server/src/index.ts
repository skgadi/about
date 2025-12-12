import { initialSuperAdminSetup } from "./db/create-tables.js";
import { startStaticServerWithSocket } from "./main-static-server.js";

startStaticServerWithSocket();

initialSuperAdminSetup();

// Temp code to remove after testing
import { listAvailableModels } from "./ai/index.js";
console.log(await listAvailableModels());
