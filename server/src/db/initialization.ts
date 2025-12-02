import dotenv from "dotenv";
dotenv.config();
import Database from "better-sqlite3";
import path from "path"; // <-- Import the path module
import fs from "fs"; // <-- Import the fs module to check and create directories
import NodeSpecificUtils from "../services/utils/node-specific.js";

const createDatabaseIfNotExists = () => {
  // create a new SQLite database if it does not exist
  // Its db name is: app-main.sqlite3
  // its folder should be: data
  const dbDirectory = path.join(NodeSpecificUtils.getProjectRoot(), "data");

  // If path does not exist, create it

  if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
  }
  // Create the database connection
  // The database file will be created in the "data" directory
  const dbFilePath = path.join(dbDirectory, "app-main.sqlite3");
  // during development, we can use the verbose option to log SQL queries
  // during production, you might want to remove this option
  if (process.env.LOG_LEVEL === "VERBOSE") {
    return new Database(dbFilePath, { verbose: console.log });
  } else {
    return new Database(dbFilePath);
  }
};

const db = createDatabaseIfNotExists();
export const getDatabase = (): any => {
  return db;
};
