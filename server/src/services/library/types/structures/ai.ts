import type {
  GSK_USER_CONTRIBUTION,
  GSK_VALIDATION_AUTHORITY,
} from "./users.js";

export interface GSK_AI_MODEL {
  id: string;
  name: string;
  description: string;
}

export interface GSK_AI_DATA_MODEL {
  model: string;
  systemInstructions: string;
  prompt: string;
}

export interface GSK_AI_RES_TITLE_1 {
  title: string;
  subtitle?: string;
}

export interface GSK_AI_RES_TITLE_2 extends GSK_AI_RES_TITLE_1 {
  shortDescription: string;
  description: string;
}

export interface GSK_AI_RES_ROLE {
  role: string[];
}

export type GSK_AI_RES_ROLE_WITH_SKILLS = GSK_USER_CONTRIBUTION;

export interface GSK_AI_RES_VALIDATION_AUTHORITY {
  validationAuthorities: string[];
}

export type GSK_AI_RES_VALIDATION_AUTHORITY_WITH_INFO =
  GSK_VALIDATION_AUTHORITY;
