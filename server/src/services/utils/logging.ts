import dotenv from "dotenv";
dotenv.config();

export const logIfVerbose = (message: any, ...optionalParams: any[]) => {
  if (process.env.VERBOSE_LOGGING === "true") {
    if (message instanceof Error) {
      console.error("SKGadi CV:", message);
    } else {
      console.log("SKGadi CV:", message);
    }
  }
};
process.env.VERBOSE_LOGGING;
