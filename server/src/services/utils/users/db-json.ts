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
    userName: db.userName || "",
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
    userName: db.userName || "",
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
    userName: dbUsers.userName || "",
    email: dbUsers.email || "",
  };
  return output;
};

export const dbToJsonUserPublicDetails = (
  dbUser: GSK_USER_DB
): GSK_USER_PUBLIC_DETAILS => {
  const output: GSK_USER_PUBLIC_DETAILS = {
    id: dbUser.id,
    userName: dbUser.userName || "",
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
    userName: dbUser.userName || "",
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
    // Timelines might have extraInfo that needs to be filtered as well base on isPublic
    output.timelines = output.timelines.map((timeline) => {
      const filteredTimeline = { ...timeline };
      if (
        filteredTimeline.extraInfo &&
        Array.isArray(filteredTimeline.extraInfo)
      ) {
        filteredTimeline.extraInfo = filteredTimeline.extraInfo.filter(
          (info) => info.isPublic
        );
      }
      return filteredTimeline;
    });
  }

  // Remove documents that are not public
  if (inputUserDetails.documents && Array.isArray(inputUserDetails.documents)) {
    output.documents = inputUserDetails.documents.filter(
      (document) => document.metaInfo.isPublic
    );
  }
  // Remove the extraInfo from documents that is not public
  if (output.documents && Array.isArray(output.documents)) {
    output.documents = output.documents.map((document) => {
      const filteredDocument = { ...document };
      if (
        filteredDocument.extraInfo &&
        Array.isArray(filteredDocument.extraInfo)
      ) {
        filteredDocument.extraInfo = filteredDocument.extraInfo.filter(
          (info) => info.isPublic
        );
      }
      return filteredDocument;
    });
  }

  // Remove events that are not public
  if (inputUserDetails.events && Array.isArray(inputUserDetails.events)) {
    output.events = inputUserDetails.events.filter(
      (event) => event.metaInfo.isPublic
    );
  }
  // Remove the extraInfo from events that is not public
  if (output.events && Array.isArray(output.events)) {
    output.events = output.events.map((event) => {
      const filteredEvent = { ...event };
      if (filteredEvent.extraInfo && Array.isArray(filteredEvent.extraInfo)) {
        filteredEvent.extraInfo = filteredEvent.extraInfo.filter(
          (info) => info.isPublic
        );
      }
      return filteredEvent;
    });
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
  // Remove the extraInfo from activities that is not public
  if (output.activities && Array.isArray(output.activities)) {
    output.activities = output.activities.map((activity) => {
      const filteredActivity = { ...activity };
      if (
        filteredActivity.extraInfo &&
        Array.isArray(filteredActivity.extraInfo)
      ) {
        filteredActivity.extraInfo = filteredActivity.extraInfo.filter(
          (info) => info.isPublic
        );
      }
      return filteredActivity;
    });
  }

  return output;
};

export const jsonToDbUser = (user: GSK_USER): GSK_USER_DB => {
  const output: GSK_USER_DB = {
    id: user.id,
    userName: user.userName || "",
    avatarUrl: user.avatarUrl || "",
    name: user.name || "",
    displayName: user.displayName || "",
    roles: JSON.stringify(user.roles),
    details: JSON.stringify(user.details),
    email: user.email || "",
    status: user.status,
    isAdmin: user.isAdmin ? 1 : 0,
    isSuperAdmin: user.isSuperAdmin ? 1 : 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    createdBy: String(user.createdBy),
    updatedBy: String(user.updatedBy),
    registeredAt: user.registeredAt,
    log: JSON.stringify(user.log),
    subscriptionBundle: JSON.stringify(user.subscriptionBundle),
    passwordHash: user.passwordHash || "",
    recoveryCode: user.recoveryCode || "",
    settings: JSON.stringify(user.settings || {}),
  };
  return output;
};
