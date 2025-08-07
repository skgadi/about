export interface GSK_APP_CONST_SETTINGS_TRANSFER {
  id: "GSK_APP_CONST_SETTINGS_TRANSFER";
  payload: {
    appName: string;
    appVersion: string;
  };
}

export interface GSK_APP_SETTINGS_TRANSFER {
  id: "GSK_APP_SETTINGS_TRANSFER";
  payload: {
    [key: string]: string | number | boolean | object | null;
  };
}
