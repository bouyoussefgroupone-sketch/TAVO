import { PGlite } from "@electric-sql/pglite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Pool, type PoolClient } from "pg";

type QueryResult<T> = { rows: T[] };
export interface SqlClient {
  query<T extends Record<string, unknown> = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
}

type RuntimeDb = PGlite | Pool;
const globalForDb = globalThis as unknown as { tavoDb?: RuntimeDb };

export function usesManagedPostgres() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): RuntimeDb {
  if (!globalForDb.tavoDb) {
    if (process.env.DATABASE_URL) {
      globalForDb.tavoDb = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: Number(process.env.DATABASE_POOL_MAX || 5),
        idleTimeoutMillis: 20_000,
        connectionTimeoutMillis: 10_000,
      });
    } else {
      const databasePath = process.env.DATABASE_PATH || ".data/tavo-pg";
      mkdirSync(dirname(databasePath), { recursive: true });
      globalForDb.tavoDb = new PGlite(databasePath);
    }
  }
  return globalForDb.tavoDb;
}

export async function rows<T extends Record<string, unknown> = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await (getDb() as unknown as SqlClient).query(sql, params);
  return result.rows as T[];
}

export async function one<T extends Record<string, unknown> = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  return (await rows<T>(sql, params))[0] ?? null;
}

export async function transaction<T>(work: (db: SqlClient) => Promise<T>): Promise<T> {
  const db = getDb();
  if (db instanceof Pool) {
    const client: PoolClient = await db.connect();
    try {
      await client.query("BEGIN");
      const result = await work(client as SqlClient);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  return db.transaction((tx) => work(tx as SqlClient));
}

export async function executeScript(sql: string) {
  const db = getDb();
  if (db instanceof Pool) await db.query(sql);
  else await db.exec(sql);
}

export async function closeDb() {
  const db = globalForDb.tavoDb;
  if (!db) return;
  if (db instanceof Pool) await db.end();
  else await db.close();
  delete globalForDb.tavoDb;
}
