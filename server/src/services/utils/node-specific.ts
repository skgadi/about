import dotenv from "dotenv";
dotenv.config();
const projectRoot = process.cwd();

class NodeSpecificUtils {
  static getProjectRoot() {
    return projectRoot;
  }

  static getEnvVariable(name: string, defaultValue?: string): string {
    return process.env[name] || defaultValue || "";
  }

  static isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }

  static isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  }
}

export default NodeSpecificUtils;
