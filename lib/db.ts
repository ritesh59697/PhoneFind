import fs from "fs";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { DbSchema } from "./types";

const isVercel = process.env.VERCEL || process.env.NODE_ENV === "production";
const file = isVercel
  ? path.join("/tmp", "db.json")
  : path.join(process.cwd(), "data", "db.json");

const defaultData: DbSchema = {
  users: [],
  devices: [],
  locationPings: [],
  events: [],
  commands: [],
};

declare global {
  // eslint-disable-next-line no-var
  var __phonefind_db__: Low<DbSchema> | undefined;
}

async function createDb() {
  if (isVercel && !fs.existsSync(file)) {
    const seedFile = path.join(process.cwd(), "data", "db.json");
    if (fs.existsSync(seedFile)) {
      try {
        fs.copyFileSync(seedFile, file);
      } catch {
        fs.writeFileSync(file, JSON.stringify(defaultData));
      }
    } else {
      fs.writeFileSync(file, JSON.stringify(defaultData));
    }
  }

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
