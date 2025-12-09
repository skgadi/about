export interface GSK_CS_USER_ROOT_PIC {
  id: "GSK_CS_USER_ROOT_PIC";
  payload: {
    userId: string;
    avatarUrl: string;
  };
}

export interface GSK_CS_USER_ROOT_FIELD {
  id: "GSK_CS_USER_ROOT_FIELD";
  payload: {
    userId: string;
    fieldName: string;
    fieldValue: string;
  };
}
