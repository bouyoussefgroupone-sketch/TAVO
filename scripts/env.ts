import fs from "node:fs";

export function loadLocalEnv() {
  if (fs.existsSync(".env.local")) process.loadEnvFile(".env.local");
}
