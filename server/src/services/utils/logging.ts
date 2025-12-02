import dotenv from "dotenv";
dotenv.config();

const showInConsole = (
  appId: string,
  type: "VERBOSE" | "MODERATE" | "CRITICAL" | "DEBUG",
  message: any,
  ...optionalParams: any[]
) => {
  const logLevel: string = process.env.LOG_LEVEL || "CRITICAL";
  switch (type) {
    case "VERBOSE":
      if (["VERBOSE"].includes(logLevel)) {
        showLogNow(appId, "VERBOSE", message, ...optionalParams);
      }
      break;
    case "MODERATE":
      if (["VERBOSE", "MODERATE"].includes(logLevel)) {
        showLogNow(appId, "MODERATE", message, ...optionalParams);
      }
      break;
    case "DEBUG":
      if (["VERBOSE", "MODERATE", "DEBUG"].includes(logLevel)) {
        showLogNow(appId, "DEBUG", message, ...optionalParams);
      }
      break;
    case "CRITICAL":
      if (["VERBOSE", "MODERATE", "DEBUG", "CRITICAL"].includes(logLevel)) {
        showLogNow(appId, "CRITICAL", message, ...optionalParams);
      }
      break;
    default:
      break;
  }
};
const showLogNow = (
  appId: string,
  logLevel: "VERBOSE" | "MODERATE" | "CRITICAL" | "DEBUG",
  message: any,
  ...optionalParams: any[]
) => {
  if (message instanceof Error) {
    console.error(`[${appId}] [${logLevel}]: `, message, ...optionalParams);
  } else {
    console.log(`[${appId}] [${logLevel}]: `, message, ...optionalParams);
  }
};

class GSKLogger {
  private appId: string;

  constructor(appId: string) {
    this.appId = appId;
  }
  verbose(message: any, ...optionalParams: any[]) {
    showInConsole(this.appId, "VERBOSE", message, ...optionalParams);
  }
  moderate(message: any, ...optionalParams: any[]) {
    showInConsole(this.appId, "MODERATE", message, ...optionalParams);
  }
  debug(message: any, ...optionalParams: any[]) {
    showInConsole(this.appId, "DEBUG", message, ...optionalParams);
  }
  critical(message: any, ...optionalParams: any[]) {
    showInConsole(this.appId, "CRITICAL", message, ...optionalParams);
  }
}

export const logger = new GSKLogger("About-Server");
