import { logger } from "../../services/utils/logging.js";
import { listAvailableModels } from "../../ai/index.js";
import {
  GSK_CS_AI_REQUEST_AVAILABLE_MODELS,
  GSK_SC_AI_AVAILABLE_MODELS,
} from "../../services/library/types/data-transfer/ai.js";
import { notifyErrorToClient } from "../../services/utils/notificatons-to-client.js";

export const routines = (io: any, socket: any) => {
  socket.on(
    "GSK_CS_AI_REQUEST_AVAILABLE_MODELS",
    async (inData: GSK_CS_AI_REQUEST_AVAILABLE_MODELS) => {
      try {
        const availableModels = await listAvailableModels();

        const responsePayload: GSK_SC_AI_AVAILABLE_MODELS = {
          id: "GSK_SC_AI_AVAILABLE_MODELS",
          payload: {
            models: availableModels,
          },
        };

        socket.emit("GSK_SC_AI_AVAILABLE_MODELS", responsePayload);
      } catch (error) {
        notifyErrorToClient(
          socket,
          "AI Model Retrieval Error",
          "An error occurred while retrieving available AI models."
        );
        logger.critical(
          "Error handling GSK_CS_AI_REQUEST_AVAILABLE_MODELS:",
          error
        );
      }
    }
  );
};
