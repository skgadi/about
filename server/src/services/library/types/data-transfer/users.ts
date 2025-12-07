import type {
  GSK_USER_PUBLIC_DETAILS,
  GSK_USER_PUBLIC_SUMMARY,
  GSK_USER_SELF_DETAILS,
} from "../structures/users.js";

export interface GSK_SC_USER_LIST_UPDATE {
  id: "GSK_SC_USER_LIST_UPDATE";
  payload: {
    usersList: GSK_USER_PUBLIC_SUMMARY[];
  };
}

export interface GSK_SC_USER_PUBLIC_DETAILS_UPDATE {
  id: "GSK_SC_USER_PUBLIC_DETAILS_UPDATE";
  payload: {
    userPublicDetails: GSK_USER_PUBLIC_DETAILS;
  };
}

export interface GSK_SC_USER_SELF_DETAILS_UPDATE {
  id: "GSK_SC_USER_SELF_DETAILS_UPDATE";
  payload: {
    userSelfDetails: GSK_USER_SELF_DETAILS;
  };
}

export interface GSK_CS_USER_LIST_REQUEST {
  id: "GSK_CS_USER_LIST_REQUEST";
  payload: object;
}

export interface GSK_CS_USER_PUBLIC_DETAILS_REQUEST {
  id: "GSK_CS_USER_PUBLIC_DETAILS_REQUEST";
  payload: {
    userId: string;
  };
}

export interface GSK_CS_USER_SELF_DETAILS_REQUEST {
  id: "GSK_CS_USER_SELF_DETAILS_REQUEST";
  payload: {
    userId: string;
  };
}
