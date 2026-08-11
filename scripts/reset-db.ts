import fs from "node:fs/promises";
import { loadLocalEnv } from "./env";

loadLocalEnv();
const target = process.env.DATABASE_PATH || ".data/tavo-pg";
const resolved = new URL(target, `file://${process.cwd().replaceAll("\\", "/")}/`).pathname;
if (!resolved.includes("/TAVO/.data/")) throw new Error("Refusing to reset a database outside the TAVO .data directory");
await fs.rm(target, { recursive: true, force: true });
console.log(`Reset ${target}`);
