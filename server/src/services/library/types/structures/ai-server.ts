import type { GoogleGenAI } from "@google/genai";

export interface GSK_AI_HANDLER {
  myGeminiAPIKey: string;
  ai: GoogleGenAI | null;
}
