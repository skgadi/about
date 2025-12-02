import {
  GSK_USER,
  GSK_USER_DB,
  GSK_USER_DETAILS,
  GSK_USER_PUBLIC_DETAILS,
  GSK_USER_PUBLIC_SUMMARY,
  GSK_USER_SELF_DETAILS,
  GSK_USER_SERVER_SUMMARY,
} from "services/library/types/structures/users.js";

export const dbToJson = (db: GSK_USER_DB): GSK_USER => {
  const output: GSK_USER = {
    id: db.id,
    username: db.username || "",
    avatarUrl: db.avatarUrl || "",
    name: db.name || "",
    displayName: db.displayName || "",
    roles: JSON.parse(db.roles),
    details: JSON.parse(db.details),
    email: db.email || "",
    status: db.status,
    isAdmin: Boolean(db.isAdmin),
    isSuperAdmin: Boolean(db.isSuperAdmin),
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
    createdBy: db.createdBy,
    updatedBy: db.updatedBy,
    registeredAt: db.registeredAt,
    log: JSON.parse(db.log),
    subscriptionBundle: JSON.parse(db.subscriptionBundle),
    passwordHash: db.passwordHash || undefined,
    recoveryCode: db.recoveryCode || undefined,
    settings: JSON.parse(db.settings || "{}"),
  };
  return output;
};

export const dbToJsonUserSummary = (
  db: GSK_USER_DB
): GSK_USER_PUBLIC_SUMMARY => {
  const output: GSK_USER_PUBLIC_SUMMARY = {
    id: db.id,
    username: db.username || "",
    avatarUrl: db.avatarUrl || "",
    name: db.name || "",
    displayName: db.displayName || "",
  };
  return output;
};

export const dbToJsonUsersSummary = (
  dbUsers: GSK_USER_DB[]
): GSK_USER_PUBLIC_SUMMARY[] => {
  return dbUsers.map((dbUser) => dbToJsonUserSummary(dbUser));
};

export const dbToJsonUserServerSummary = (
  dbUsers: GSK_USER_DB
): GSK_USER_SERVER_SUMMARY => {
  const output: GSK_USER_SERVER_SUMMARY = {
    id: dbUsers.id,
    settings: JSON.parse(dbUsers.settings || "{}"),
    isAdmin: Boolean(dbUsers.isAdmin),
    isSuperAdmin: Boolean(dbUsers.isSuperAdmin),
    status: dbUsers.status,
    avatarUrl: dbUsers.avatarUrl || "",
    displayName: dbUsers.displayName || "",
    name: dbUsers.name || "",
    username: dbUsers.username || "",
    email: dbUsers.email || "",
  };
  return output;
};

export const dbToJsonUserPublicDetails = (
  dbUser: GSK_USER_DB
): GSK_USER_PUBLIC_DETAILS => {
  const output: GSK_USER_PUBLIC_DETAILS = {
    id: dbUser.id,
    username: dbUser.username || "",
    avatarUrl: dbUser.avatarUrl || "",
    name: dbUser.name || "",
    displayName: dbUser.displayName || "",
    roles: JSON.parse(dbUser.roles),
    details: keepOnlyPublicDetails(JSON.parse(dbUser.details)),
  };
  return output;
};

export const dbToJsonUserSelf = (
  dbUser: GSK_USER_DB
): GSK_USER_SELF_DETAILS => {
  const output: GSK_USER_SELF_DETAILS = {
    id: dbUser.id,
    username: dbUser.username || "",
    avatarUrl: dbUser.avatarUrl || "",
    name: dbUser.name || "",
    displayName: dbUser.displayName || "",
    roles: JSON.parse(dbUser.roles),
    details: JSON.parse(dbUser.details),
    email: dbUser.email || "",
    status: dbUser.status,
    isAdmin: Boolean(dbUser.isAdmin),
    isSuperAdmin: Boolean(dbUser.isSuperAdmin),
    createdAt: dbUser.createdAt,
    updatedAt: dbUser.updatedAt,
    createdBy: dbUser.createdBy,
    updatedBy: dbUser.updatedBy,
    registeredAt: dbUser.registeredAt,
    log: JSON.parse(dbUser.log),
    subscriptionBundle: JSON.parse(dbUser.subscriptionBundle),
    settings: JSON.parse(dbUser.settings || "{}"),
  };
  return output;
};

const keepOnlyPublicDetails = (
  inputUserDetails: GSK_USER_DETAILS
): GSK_USER_DETAILS => {
  // Return only public details
  const output: GSK_USER_DETAILS = inputUserDetails.metaInfo.isPublic
    ? JSON.parse(JSON.stringify(inputUserDetails))
    : { metaInfo: {} };

  // Remove timelines that are not public
  if (inputUserDetails.timelines && Array.isArray(inputUserDetails.timelines)) {
    output.timelines = inputUserDetails.timelines.filter(
      (timeline) => timeline.metaInfo.isPublic
    );
  }

  // Remove documents that are not public
  if (inputUserDetails.documents && Array.isArray(inputUserDetails.documents)) {
    output.documents = inputUserDetails.documents.filter(
      (document) => document.metaInfo.isPublic
    );
  }

  // Remove events that are not public
  if (inputUserDetails.events && Array.isArray(inputUserDetails.events)) {
    output.events = inputUserDetails.events.filter(
      (event) => event.metaInfo.isPublic
    );
  }

  // Remove activities that are not public
  if (
    inputUserDetails.activities &&
    Array.isArray(inputUserDetails.activities)
  ) {
    output.activities = inputUserDetails.activities.filter(
      (activity) => activity.metaInfo.isPublic
    );
  }

  return output;
};
