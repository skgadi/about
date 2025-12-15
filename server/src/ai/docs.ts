import {
  GSK_DOCUMENT,
  GSK_META_INFO,
  GSK_USER_CONTRIBUTION,
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

const uploadedDocs: GSK_AI_SV_UPLOADED_DOC[] = [];
const ai = getAIHandler().ai;

export async function getAiDocIdx(
  doc: GSK_DOCUMENT,
  userId: string
): Promise<number> {
  try {
    // check if the doc is already uploaded
    const existingDocIdx = uploadedDocs.findIndex(
      (d) => d.docId === doc.id && d.userId === userId
    );
    // If exists and not expired, return the index
    const isExpired =
      existingDocIdx >= 0 &&
      moment(uploadedDocs[existingDocIdx].expiresAt).isBefore(moment());
    if (existingDocIdx >= 0 && !isExpired) {
      return existingDocIdx;
    }
    // If exists and expired, remove it from the list
    if (isExpired && existingDocIdx >= 0) {
      uploadedDocs.splice(existingDocIdx, 1);
    }

    // upload the doc to Google GenAI and get a handle
    if (!ai) {
      logger.moderate("AI handler is not initialized.");
      return -1;
    }
    console.log(`Uploading document ${doc.id} for user ${userId} to AI`);
    const filePath = await filesFolder.getUserDocumentFilePath(userId, doc.id);
    const file = await ai.files.upload({
      file: filePath,
      config: {
        displayName: doc.originalName || doc.metaInfo.title || doc.id,
        mimeType: doc.mimeType || "application/octet-stream",
      },
    });
    // wait for the file to be processed
    let getFile = await ai.files.get({ name: file.name! });
    while (getFile.state === "PROCESSING") {
      getFile = await ai.files.get({ name: file.name! });
      console.log(`current file status: ${getFile.state}`);
      console.log("File is still processing, retrying in 5 seconds");

      await new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });
    }
    if (getFile.state === "FAILED") {
      logger.moderate(
        `File processing failed for file ${file.name} with state ${getFile.state}`
      );
      return -1;
    }

    const expiresAt = moment().add(48, "hours").toISOString();
    const uploadedDoc: GSK_AI_SV_UPLOADED_DOC = {
      docId: doc.id,
      userId,
      expiresAt,
      uploadedAt: moment().toISOString(),
      uniqueGeminiId: file.name!,
    };
    uploadedDocs.push(uploadedDoc);
    return uploadedDocs.length - 1;
  } catch (error) {
    logger.moderate("AI Doc Upload Error:", error);
    return -1;
  }
}

export const getSummaryOfAiDoc = async (
  socket: Socket,
  userId: string,
  doc: GSK_DOCUMENT,
  userName: string
): Promise<GSK_META_INFO | null> => {
  const aiDocIdx = await getAiDocIdx(doc, userId);
  if (aiDocIdx < 0) {
    logger.moderate("Failed to get AI document index.");
    return null;
  }
  if (!ai) {
    logger.moderate("AI handler is not initialized.");
    return null;
  }

  // Obtain the file object
  const file = await ai.files.get({
    name: uploadedDocs[aiDocIdx].uniqueGeminiId,
  });
  if (file.state !== "ACTIVE" && !file.uri && !file.mimeType) {
    logger.moderate(
      `File is not active for docId ${doc.id} with state ${file.state} or invalid uri ${file.uri} or mimeType ${file.mimeType}`
    );
    return null;
  }
  if (!file.uri || !file.mimeType) {
    logger.moderate(
      `File has invalid uri ${file.uri} or mimeType ${file.mimeType} for docId ${doc.id}`
    );
    return null;
  }
  const userSelectedModel = getUserSelectedModel(socket.id);

  // Generate Meta Info
  const metaInfo = await generateMetaInfoFromAi(
    getUserSelectedModel(socket.id).id,
    file
  );
  if (!metaInfo) {
    return null;
  }

  // Obtain User Contributions
  metaInfo.authors = metaInfo.authors || [];
  const contributions = await obtainUserContributions(
    userSelectedModel.id,
    file,
    userName
  );
  if (!contributions) {
    return metaInfo;
  }
  metaInfo.userContribution = contributions;
  metaInfo.isPublic = doc.metaInfo.isPublic || false;
  return metaInfo;
};

export const generateMetaInfoFromAi = async (
  aiModel: string,
  file: File
): Promise<GSK_META_INFO | null> => {
  try {
    const content: any[] = [
      `Extract the main information as per the following schema: ${JSON.stringify(
        metaFormats.metaMainInfo.toJSONSchema()
      )}. Provide only the JSON output without any additional text.`,
    ];
    content.push(
      createPartFromUri(file.uri!, file.mimeType || "application/octet-stream")
    );

    const response = await ai!.models.generateContent({
      model: aiModel,
      contents: content,
      config: {
        temperature: 0.25,
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
      logger.moderate("AI Meta Info Parsing Failed:", parsed.error);
    }
    const generatedMeta: GSK_META_INFO = {
      title: parsed.data?.title || "",
      subtitle: parsed.data?.subTitle || "",
      description: parsed.data?.description || "",
      shortDescription: parsed.data?.shortDescription || "",
      keywords: parsed.data?.keywords || [],
      authors: parsed.data?.authors || [],
      publishedDate: moment(parsed.data?.publishedDate).isValid()
        ? moment(parsed.data?.publishedDate).toISOString()
        : undefined,
    };
    return generatedMeta;
  } catch (error) {
    logger.moderate("AI Meta Info Generation Error:", error);
    return null;
  }
  return null;
};

const obtainUserContributions = async (
  aiModel: string,
  file: File,
  userName: string
): Promise<GSK_USER_CONTRIBUTION[] | null> => {
  try {
    const roles = await obtainRoles(aiModel, file, userName);
    if (!roles) {
      return null;
    }
    const contributions: GSK_USER_CONTRIBUTION[] = await Promise.all(
      roles.map(async (role) => {
        const skills = await obtainSkills(aiModel, file, userName, role.role);
        return {
          userRole: role.role,
          contributionDate: role.date,
          skillsApplied:
            skills?.map((skill) => ({
              name: skill.skill,
              type: skill.type_isSoft ? "soft" : "tech",
            })) || [],
          notes: role.notes,
        };
      })
    );

    return contributions;
  } catch (error) {
    logger.moderate("AI User Contributions Generation Error:", error);
    return null;
  }
};

const obtainSkills = async (
  aiModel: string,
  file: File,
  userName: string,
  role: string
): Promise<{ skill: string; type_isSoft: boolean }[] | null> => {
  try {
    const content: any[] = [
      `List the skills \`${userName}\` has applied in the content along with their type (soft/hard). Format the output as JSON following the schema: ${JSON.stringify(
        metaFormats.metaListSkills(userName, role).toJSONSchema()
      )}. Provide only the JSON output without any additional text.`,
    ];
    content.push(
      createPartFromUri(file.uri!, file.mimeType || "application/octet-stream")
    );
    const response = await ai!.models.generateContent({
      model: aiModel,
      contents: content,
      config: {
        temperature: 0.25,
      },
    });
    // remove ```json ... ``` if present
    const improvedText = response.text
      ? response.text.replace(/```json/g, "").replace(/```/g, "")
      : "";
    const parsed = metaFormats
      .metaListSkills(userName, role)
      .safeParse(JSON.parse(improvedText || "{}"));
    if (!parsed.success) {
      logger.moderate("AI User Skills Parsing Failed:", parsed.error);
      return null;
    }
    const skillsList: { skill: string; type_isSoft: boolean }[] = [];
    parsed.data?.skills.forEach((skillItem) => {
      skillsList.push({
        skill: skillItem.name,
        type_isSoft: skillItem.type_isSoft,
      });
    });

    return skillsList;
  } catch (error) {
    logger.moderate("AI User Skills Generation Error:", error);
    return null;
  }
};

const obtainRoles = async (
  aiModel: string,
  file: File,
  userName: string
): Promise<{ role: string; notes: string; date: string }[] | null> => {
  try {
    const content: any[] = [
      `List the roles \`${userName}\` has undertaken in various tasks for the content along with their justifications. Format the output as JSON following the schema: ${JSON.stringify(
        metaFormats.metaListRoles(userName).toJSONSchema()
      )}. Provide only the JSON output without any additional text.`,
    ];
    content.push(
      createPartFromUri(file.uri!, file.mimeType || "application/octet-stream")
    );
    const response = await ai!.models.generateContent({
      model: aiModel,
      contents: content,
      config: {
        temperature: 0.25,
      },
    });
    // remove ```json ... ``` if present
    const improvedText = response.text
      ? response.text.replace(/```json/g, "").replace(/```/g, "")
      : "";
    const parsed = metaFormats
      .metaListRoles(userName)
      .safeParse(JSON.parse(improvedText || "{}"));
    if (!parsed.success) {
      logger.moderate("AI User Roles Parsing Failed:", parsed.error);
      return null;
    }
    const rolesList: { role: string; notes: string; date: string }[] = [];
    parsed.data?.roles.forEach((roleItem) => {
      rolesList.push({
        role: roleItem.role,
        notes: roleItem.notes,
        date: roleItem.date,
      });
    });

    return rolesList;
  } catch (error) {
    logger.moderate("AI User Roles Generation Error:", error);
    return null;
  }
};
