import type { GoogleGenAI } from "@google/genai";

export interface GSK_AI_HANDLER {
  myGeminiAPIKey: string;
  ai: GoogleGenAI | null;
}

export interface GSK_AI_SV_UPLOADED_DOC {
  docId: string;
  userId: string;
  uploadedAt: string; // ISO date string
  expiresAt: string; // ISO date string
  uniqueGeminiId: string; // google genai unique file id which is `name` field in file object file.get({name: uniqueGeminiId})
}
