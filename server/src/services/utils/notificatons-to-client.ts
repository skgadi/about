import { GSK_SC_NOTIFICATION } from "services/library/types/data-transfer/notifications.js";

export const notifyErrorToClient = (
  socketOrIo: any,
  caption: string,
  message: string
) => {
  const payload: GSK_SC_NOTIFICATION = {
    id: "GSK_SC_NOTIFICATION",
    payload: {
      type: "error",
      position: "top-right",
      timeout: 5000,
      caption,
      message,
      icon: "error",
    },
  };
  socketOrIo.emit("GSK_SC_NOTIFICATION", payload);
};

export const notifySuccessToClient = (
  socketOrIo: any,
  caption: string,
  message: string
) => {
  const payload: GSK_SC_NOTIFICATION = {
    id: "GSK_SC_NOTIFICATION",
    payload: {
      type: "success",
      position: "top-right",
      timeout: 2000,
      caption,
      message,
      icon: "check_circle",
    },
  };
  socketOrIo.emit("GSK_SC_NOTIFICATION", payload);
};
