import { GSK_AI_MODEL } from "services/library/types/structures/ai.js";
import { getAIHandler } from "./init.js";

const listOfAvailableModelsWithSupportedOutputs = [
  "models/gemini-3-pro-preview",
  "models/gemini-2.5-pro",
  "models/gemini-2.5-flash",
  "models/gemini-2.5-flash-lite",
];

export const listAvailableModels = async () => {
  const aiHandler = getAIHandler();
  if (!aiHandler.ai) {
    throw new Error("AI handler is not initialized.");
  }

  const models = await aiHandler.ai.models.list();
  // Models is a pager
  // Map the models to read Name and Supported actions
  const out: GSK_AI_MODEL[] = [];
  do {
    const thisPageSize = models.pageLength;
    for (let i = 0; i < thisPageSize; i++) {
      const model = await models.getItem(i);
      if (
        !listOfAvailableModelsWithSupportedOutputs.includes(model.name || "")
      ) {
        continue;
      }
      out.push({
        id: model.name || "",
        name: model.displayName || "",
        description: model.description || "",
      });
    }
    await models.nextPage();
  } while (await models.hasNextPage());
  return out;
};
