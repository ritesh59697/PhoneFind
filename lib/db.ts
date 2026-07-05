import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { DbSchema } from "./types";

const file = path.join(process.cwd(), "data", "db.json");

const defaultData: DbSchema = {
  users: [],
  devices: [],
  locationPings: [],
  events: [],
  commands: [],
};

// A single shared instance across API routes (dev-mode friendly with globalThis
// to survive Next.js hot-reload without reopening the file repeatedly).
declare global {
  // eslint-disable-next-line no-var
  var __phonefind_db__: Low<DbSchema> | undefined;
}

async function createDb() {
  const adapter = new JSONFile<DbSchema>(file);
  const db = new Low<DbSchema>(adapter, defaultData);
  await db.read();
  db.data ||= defaultData;
  await db.write();
  return db;
}

export async function getDb() {
  if (!global.__phonefind_db__) {
    global.__phonefind_db__ = await createDb();
  } else {
    await global.__phonefind_db__.read();
  }
  return global.__phonefind_db__;
}

/**
 * NOTE for production: this JSON-file store is only meant for local
 * development and testing. Swap this module for a real database
 * (Postgres via Prisma, or similar) before going live — a JSON file
 * cannot safely handle concurrent writes at scale.
 */
