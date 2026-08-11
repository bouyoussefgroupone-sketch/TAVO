import { PGlite, type Transaction } from "@electric-sql/pglite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

type PGliteDb = PGlite;

const globalForDb = globalThis as unknown as { tavoDb?: PGliteDb };

export function getDb(): PGliteDb {
  if (!globalForDb.tavoDb) {
    const databasePath = process.env.DATABASE_PATH || ".data/tavo-pg";
    mkdirSync(dirname(databasePath), { recursive: true });
    globalForDb.tavoDb = new PGlite(databasePath);
  }
  return globalForDb.tavoDb;
}

export async function rows<T extends Record<string, unknown> = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await getDb().query<T>(sql, params);
  return result.rows;
}

export async function one<T extends Record<string, unknown> = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  return (await rows<T>(sql, params))[0] ?? null;
}

export async function transaction<T>(work: (db: Transaction) => Promise<T>): Promise<T> {
  return getDb().transaction(work);
}
