import { GoogleGenAI, Model } from "@google/genai";
import { GSK_AI_HANDLER } from "../services/library/types/structures/ai-server.js";
import NodeSpecificUtils from "../services/utils/node-specific.js";

const aiHandler: GSK_AI_HANDLER = {
  myGeminiAPIKey: "", // Replace with your actual API key
  ai: null,
};

export const setANewAPIKey = (newKey: string) => {
  aiHandler.myGeminiAPIKey = newKey;
  aiHandler.ai = new GoogleGenAI({
    apiKey: aiHandler.myGeminiAPIKey,
  });
};

export function initAI() {
  setANewAPIKey(NodeSpecificUtils.getEnvVariable("GEMINI_API_KEY", ""));
}

initAI();

export const getAIHandler = (): GSK_AI_HANDLER => {
  return aiHandler;
};
