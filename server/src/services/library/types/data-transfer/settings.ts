import type {
  GSK_STRUCTURES_CONSTANT_SETTINGS,
  GSK_STRUCTURES_VARIABLE_SETTINGS,
} from "../structures/settings.js";
import type { GSK_USER_SETTINGS } from "../structures/users.js";

export interface GSK_APP_CONST_SETTINGS_TRANSFER {
  id: "GSK_APP_CONST_SETTINGS_TRANSFER";
  payload: GSK_STRUCTURES_CONSTANT_SETTINGS;
}

export interface GSK_APP_VAR_SETTINGS_TRANSFER {
  id: "GSK_APP_VAR_SETTINGS_TRANSFER";
  payload: GSK_STRUCTURES_VARIABLE_SETTINGS;
}

export interface GSK_CS_UPDATE_USER_SETTING {
  id: "GSK_CS_UPDATE_USER_SETTING";
  payload: {
    userId: string;
    settings: GSK_USER_SETTINGS;
  };
}
