import fs from "node:fs/promises";
import path from "node:path";
import { loadLocalEnv } from "./env";
import { closeDb, executeScript, rows } from "../lib/db";

loadLocalEnv();
await executeScript("CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
const dir = path.join(process.cwd(), "migrations");
for (const file of (await fs.readdir(dir)).filter((name) => name.endsWith(".sql")).sort()) {
  if ((await rows("SELECT 1 AS applied FROM schema_migrations WHERE version = $1", [file])).length) continue;
  await executeScript(await fs.readFile(path.join(dir, file), "utf8"));
  await rows("INSERT INTO schema_migrations(version) VALUES ($1) ON CONFLICT DO NOTHING RETURNING version", [file]);
  console.log(`Applied ${file}`);
}
await closeDb();
