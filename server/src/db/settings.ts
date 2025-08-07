import { getDatabase } from "./initialization.js";

export const readKey = (key: string): string | null => {
  const db = getDatabase();
  const stmt = db.prepare("SELECT value FROM settings WHERE key = ?");
  const result = stmt.get(key);
  return result ? result.value : null;
};

export const writeKey = (key: string, value: string): boolean => {
  const db = getDatabase();
  const stmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
  const result = stmt.run(key, value);
  return result.changes > 0;
};

export const getAllSettings = (): { [key: string]: string } => {
  const db = getDatabase();
  const stmt = db.prepare("SELECT key, value FROM settings");
  const rows = stmt.all();
  const settings: { [key: string]: string } = {};
  rows.forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });
  return settings;
};

export default getAllSettings;
