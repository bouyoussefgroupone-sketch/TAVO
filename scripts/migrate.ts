import fs from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { loadLocalEnv } from "./env";

loadLocalEnv();
const databasePath = process.env.DATABASE_PATH || ".data/tavo-pg";
await fs.mkdir(path.dirname(databasePath), { recursive: true });
const db = new PGlite(databasePath);
await db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
const dir = path.join(process.cwd(), "migrations");
for (const file of (await fs.readdir(dir)).filter((name) => name.endsWith(".sql")).sort()) {
  const applied = await db.query("SELECT 1 FROM schema_migrations WHERE version = $1", [file]);
  if (applied.rows.length) continue;
  await db.exec(await fs.readFile(path.join(dir, file), "utf8"));
  await db.query("INSERT INTO schema_migrations(version) VALUES ($1) ON CONFLICT DO NOTHING", [file]);
  console.log(`Applied ${file}`);
}
await db.close();
