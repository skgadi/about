import type { GSK_AI_MODEL } from '../structures/ai.js';

export interface GSK_CS_AI_REQUEST_AVAILABLE_MODELS {
  id: 'GSK_CS_AI_REQUEST_AVAILABLE_MODELS';
}

export interface GSK_SC_AI_AVAILABLE_MODELS {
  id: 'GSK_SC_AI_AVAILABLE_MODELS';
  payload: {
    models: GSK_AI_MODEL[];
  };
}
