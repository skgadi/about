import {
  GSK_DOCUMENT,
  GSK_META_INFO,
  GSK_USER_CONTRIBUTION,
  GSK_VALIDATION_AUTHORITY,
} from "../services/library/types/structures/users.js";
import { GSK_AI_SV_UPLOADED_DOC } from "../services/library/types/structures/ai-server.js";
import { logger } from "../services/utils/logging.js";
import moment from "moment";
import { getAIHandler } from "./init.js";
import filesFolder from "../services/utils/users/files-folder.js";
import { getUserSelectedModel } from "./models.js";
import { Socket } from "socket.io";
import { createPartFromUri, File } from "@google/genai";
import metaFormats from "./meta.js";
import { getAiFile } from "./docs.js";

const ai = getAIHandler().ai;

export const generateSkillsAndNotes = async (
  socket: Socket,
  userId: string,
  doc: GSK_DOCUMENT,
  userName: string,
  allNames: string[],
  roleIdx: number
) => {
  if ((doc?.metaInfo?.userContribution?.length || 0) <= roleIdx) {
    throw new Error(
      `No user contributions found for user ${userId} on document ${doc.id}`
    );
  }

  const aiModel = getUserSelectedModel(socket.id);
  const content = await getAiFile(doc, userId);

  const role = doc.metaInfo.userContribution![roleIdx].userRole;
  const userProfile = {
    primaryName: userName,
    knownAliases: allNames,
    role: role,
  };
  const systemInstruction = `You are a professional auditor. 
Analyze the provided document to extract skills for the user defined in the USER_CONTEXT.

OUTPUT SCHEMA:
${JSON.stringify(
  metaFormats.MetaListSkillsWithNotes(userName, role).toJSONSchema()
)}

STRICT RULES:
- Output ONLY valid JSON. 
- No markdown, no backticks, no preamble.
- Categorize skills as "Technical" or "Soft".
- If no skills are found, return: {"skills": []}`;
  const userPromptText = `
USER_CONTEXT: ${JSON.stringify(userProfile)}

TASK: Analyze the attached document. Identify and list the skills this specific user applied in their role, and provide concise notes on their contributions.`;

  const response = await ai!.models.generateContent({
    model: aiModel.id,
    contents: [
      {
        role: "user",
        parts: [
          ...content, // This contains your file (createPartFromUri)
          { text: userPromptText }, // This contains your instructions and JSON context
        ],
      },
    ],
    config: {
      temperature: 0.25,
      systemInstruction,
    },
  });

  // remove ```json ... ``` if present
  const improvedText = response.text
    ? response.text.replace(/```json/g, "").replace(/```/g, "")
    : "";
  const parsed = metaFormats
    .MetaListSkillsWithNotes(userName, role)
    .safeParse(JSON.parse(improvedText || "{}"));

  if (!parsed.success) {
    throw new Error(
      `Failed to parse AI response for skills and notes: ${parsed.error.message}`
    );
  }
  const skillsList = parsed.data;

  doc.metaInfo.userContribution![roleIdx].skillsApplied = skillsList.skills.map(
    (s) => ({
      name: s.name,
      type: s.type_isSoft ? "soft" : "tech",
    })
  );
  doc.metaInfo.userContribution![roleIdx].notes = skillsList.notes;
};

export const generateContributions = async (
  socket: Socket,
  userId: string,
  doc: GSK_DOCUMENT,
  userName: string,
  allNames: string[]
) => {
  const aiModel = getUserSelectedModel(socket.id);
  const content = await getAiFile(doc, userId);

  const userProfile = {
    primaryName: userName,
    knownAliases: allNames,
  };
  const systemInstruction = `You are a professional auditor. 
Analyze the provided document to extract user contributions for the user defined in the USER_CONTEXT.

OUTPUT SCHEMA:
${JSON.stringify(metaFormats.metaListRoles(userName).toJSONSchema())}

STRICT RULES:
- Output ONLY valid JSON. 
- No markdown, no backticks, no preamble.
- If no contributions are found, return: {"roles": []}`;
  const userPromptText = `
USER_CONTEXT: ${JSON.stringify(userProfile)}

TASK: Analyze the attached document. Identify and list the roles that this specific user has undertaken in various tasks for the content along with justification for each role.`;

  const response = await ai!.models.generateContent({
    model: aiModel.id,
    contents: [
      {
        role: "user",
        parts: [
          ...content, // This contains your file (createPartFromUri)
          { text: userPromptText }, // This contains your instructions and JSON context
        ],
      },
    ],
    config: {
      temperature: 0.25,
      systemInstruction,
    },
  });

  // remove ```json ... ``` if present
  const improvedText = response.text
    ? response.text.replace(/```json/g, "").replace(/```/g, "")
    : "";
  console.log("AI Contributions Response:", improvedText);
  const parsed = metaFormats
    .metaListRoles(userName)
    .safeParse(JSON.parse(improvedText || "{}"));

  if (!parsed.success) {
    throw new Error(
      `Failed to parse AI response for contributions: ${parsed.error.message}`
    );
  }
  const rolesList = parsed.data;

  doc.metaInfo.userContribution = rolesList.roles.map(
    (role) =>
      ({
        userRole: role.role,
        contributionDate: role.date,
        skillsApplied: [],
      } as GSK_USER_CONTRIBUTION)
  );

  // For each role, generate skills and notes
  for (let i = 0; i < rolesList.roles.length; i++) {
    try {
      await generateSkillsAndNotes(socket, userId, doc, userName, allNames, i);
    } catch (error) {
      logger.moderate(
        `Error generating skills and notes for role index ${i} for user ${userId} on document ${doc.id}: ${error}`
      );
    }
  }
};

export const generateValidationAuthorities = async (
  socket: Socket,
  userId: string,
  doc: GSK_DOCUMENT,
  userName: string,
  allNames: string[]
) => {
  const aiModel = getUserSelectedModel(socket.id);
  const content = await getAiFile(doc, userId);

  const systemInstruction = `You are a professional auditor. 
Analyze the provided document to extract validation authorities for the content. The url information may or may not be present in the document. Use your knowledge to obtain the authority URL if not explicitly mentioned in the document.

OUTPUT SCHEMA:
${JSON.stringify(metaFormats.metaValidationAuthorities.toJSONSchema())}

STRICT RULES:
- Output ONLY valid JSON. 
- No markdown, no backticks, no preamble.
- If no validation authorities are found, return: {"authorities": []}`;
  const userPromptText = `
TASK: Analyze the attached document. Identify and list any authorities (institutions, organizations, or individuals) that have validated or endorsed the content of the document. Provide details such as name, type, validation date, URL, and any relevant notes.`;

  const response = await ai!.models.generateContent({
    model: aiModel.id,
    contents: [
      {
        role: "user",
        parts: [
          ...content, // This contains your file (createPartFromUri)
          { text: userPromptText }, // This contains your instructions and JSON context
        ],
      },
    ],
    config: {
      temperature: 0.25,
      systemInstruction,
    },
  });
  // remove ```json ... ``` if present
  const improvedText = response.text
    ? response.text.replace(/```json/g, "").replace(/```/g, "")
    : "";

  console.log("AI Validation Authorities Response:", improvedText);
  const parsed = metaFormats.metaValidationAuthorities.safeParse(
    JSON.parse(improvedText || "{}")
  );

  if (!parsed.success) {
    throw new Error(
      `Failed to parse AI response for validation authorities: ${parsed.error.message}`
    );
  }
  const authoritiesList = parsed.data;

  doc.metaInfo.validationAuthority = authoritiesList.authorities;
};

export const generateDocumentMainMetaInfo = async (
  socket: Socket,
  userId: string,
  doc: GSK_DOCUMENT
) => {
  const aiModel = getUserSelectedModel(socket.id);
  const content = await getAiFile(doc, userId);

  const systemInstruction = `You are a professional auditor. 
Analyze the provided document to extract main meta information including title, summary, and keywords.
OUTPUT SCHEMA:
${JSON.stringify(metaFormats.metaMainInfo.toJSONSchema())}
STRICT RULES:
- Output ONLY valid JSON. 
- No markdown, no backticks, no preamble.
- If no meta information is found, return: {"title": "", "description": "", "shortDescription": "", "keywords": [], "authors": []}`;
  const userPromptText = `
TASK: Analyze the attached document. Identify and extract the main meta information including title, subtitle, detailed description, short description, keywords, authors, and published date.`;

  const response = await ai!.models.generateContent({
    model: aiModel.id,
    contents: [
      {
        role: "user",
        parts: [
          ...content, // This contains your file (createPartFromUri)
          { text: userPromptText }, // This contains your instructions and JSON context
        ],
      },
    ],
    config: {
      temperature: 0.25,
      systemInstruction,
    },
  });

  // remove ```json ... ``` if present
  const improvedText = response.text
    ? response.text.replace(/```json/g, "").replace(/```/g, "")
    : "";
  const parsed = metaFormats.metaMainInfo.safeParse(
    JSON.parse(improvedText || "{}")
  );

  if (!parsed.success) {
    throw new Error(
      `Failed to parse AI response for main meta info: ${parsed.error.message}`
    );
  }
  const mainMetaInfo = parsed.data;

  doc.metaInfo.title = mainMetaInfo.title;
  doc.metaInfo.subtitle = mainMetaInfo.subTitle || undefined;
  doc.metaInfo.description = mainMetaInfo.description;
  doc.metaInfo.shortDescription = mainMetaInfo.shortDescription;
  doc.metaInfo.keywords = mainMetaInfo.keywords;
  doc.metaInfo.authors = mainMetaInfo.authors;
  doc.metaInfo.publishedDate = mainMetaInfo.publishedDate || undefined;
};

export const generateAllDocumentMetaInfo = async (
  socket: Socket,
  userId: string,
  document: GSK_DOCUMENT,
  userName: string,
  allNames: string[]
) => {
  try {
    await generateDocumentMainMetaInfo(socket, userId, document);
  } catch (error) {
    logger.moderate(
      `Error generating main meta info for user ${userId} on document ${document.id}: ${error}`
    );
  }

  try {
    await generateContributions(socket, userId, document, userName, allNames);
  } catch (error) {
    logger.moderate(
      `Error generating contributions for user ${userId} on document ${document.id}: ${error}`
    );
  }

  try {
    await generateValidationAuthorities(
      socket,
      userId,
      document,
      userName,
      allNames
    );
  } catch (error) {
    logger.moderate(
      `Error generating validation authorities for user ${userId} on document ${document.id}: ${error}`
    );
  }
};
