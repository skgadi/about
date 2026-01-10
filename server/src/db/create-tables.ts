import { logger } from "../services/utils/logging.js";
import { getDatabase } from "./initialization.js";
import NodeSpecificUtils from "../services/utils/node-specific.js";
import { v7 as uuidv7 } from "uuid";
import { genSaltSync, hashSync } from "bcrypt";

const db = getDatabase();

export const createTables = () => {
  // Create settings database
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL
    );
  `);

  // Create tables if they do not exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, -- uuid
      userName TEXT UNIQUE COLLATE NOCASE COLLATE RTRIM,
      avatarUrl TEXT,
      names TEXT NOT NULL DEFAULT '[]',
      displayName TEXT ,
      roles TEXT NOT NULL DEFAULT '[]',
      details TEXT NOT NULL DEFAULT '{"metaInfo": {}}',
      email TEXT UNIQUE COLLATE NOCASE COLLATE RTRIM,
      status TEXT NOT NULL DEFAULT 'created',
      isAdmin INTEGER NOT NULL DEFAULT 0, -- boolean
      isSuperAdmin INTEGER NOT NULL DEFAULT 0, -- boolean
      createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      createdBy TEXT NOT NULL,
      updatedBy TEXT NOT NULL,
      registeredAt TEXT NOT NULL,
      log TEXT NOT NULL DEFAULT '[]',
      subscriptionBundle TEXT NOT NULL DEFAULT '{}',
      passwordHash TEXT,
      recoveryCode TEXT,
      settings TEXT NOT NULL DEFAULT '{}'
    );
  `);

  logger.verbose("Tables created or already exist.");
};

export const initialSuperAdminSetup = () => {
  // Ensure tables are created before setting up the super admin
  createTables();

  const defaultAdminEmail = NodeSpecificUtils.getEnvVariable(
    "DEFAULT_ADMIN_EMAIL",
    "gadisureshkumar@gmail.com"
  );

  const existingAdmin = db
    .prepare("SELECT * FROM users WHERE email = ? AND isSuperAdmin = 1")
    .get(defaultAdminEmail);

  if (existingAdmin) {
    logger.verbose(
      "Super admin already exists. Skipping initial super admin setup."
    );
    return;
  }

  const defaultAdminPassword = NodeSpecificUtils.getEnvVariable(
    "DEFAULT_ADMIN_PASSWORD",
    "admin123"
  );
  const id = uuidv7();
  const salt = genSaltSync(10);
  const passwordHash = hashSync(defaultAdminPassword, salt);

  db.prepare(
    `
    INSERT INTO users (
      id, userName, email, status, isAdmin, isSuperAdmin, passwordHash, createdBy, updatedBy, registeredAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `
  ).run(
    id,
    NodeSpecificUtils.getEnvVariable("DEFAULT_userName", "skgadi"),
    defaultAdminEmail,
    "active",
    1,
    1,
    passwordHash,
    id,
    id,
    "system"
  );

  logger.verbose(`Super admin user created with email: ${defaultAdminEmail}`);
};
