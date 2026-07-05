import fs from "fs";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import mongoose from "mongoose";
import { DbSchema, User, Device, LocationPing, DeviceEvent, Command } from "./types";
import { UserModel, DeviceModel, LocationPingModel, EventModel, CommandModel } from "./mongooseModels";

const MONGODB_URI = process.env.MONGODB_URI;

class MongoDbAdapter {
  data: DbSchema;

  constructor() {
    this.data = {
      users: [],
      devices: [],
      locationPings: [],
      events: [],
      commands: [],
    };
  }

  async read() {
    if (!MONGODB_URI) return;
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      }
      const [users, devices, locationPings, events, commands] = await Promise.all([
        UserModel.find().lean(),
        DeviceModel.find().lean(),
        LocationPingModel.find().lean(),
        EventModel.find().lean(),
        CommandModel.find().lean(),
      ]);

      this.data = {
        users: (users || []) as unknown as User[],
        devices: (devices || []) as unknown as Device[],
        locationPings: (locationPings || []) as unknown as LocationPing[],
        events: (events || []) as unknown as DeviceEvent[],
        commands: (commands || []) as unknown as Command[],
      };
    } catch (err) {
      console.error("MongoDB Atlas read error:", err);
    }
  }

  async write() {
    if (!MONGODB_URI) return;
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      }
      await Promise.all([
        ...this.data.users.map((u) => UserModel.updateOne({ id: u.id }, u, { upsert: true })),
        ...this.data.devices.map((d) => DeviceModel.updateOne({ id: d.id }, d, { upsert: true })),
        ...this.data.locationPings.map((l) => LocationPingModel.updateOne({ id: l.id }, l, { upsert: true })),
        ...this.data.events.map((e) => EventModel.updateOne({ id: e.id }, e, { upsert: true })),
        ...this.data.commands.map((c) => CommandModel.updateOne({ id: c.id }, c, { upsert: true })),
      ]);
    } catch (err) {
      console.error("MongoDB Atlas write error:", err);
    }
  }
}

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
  var __phonefind_db__: { data: DbSchema; read(): Promise<void>; write(): Promise<void> } | undefined;
}

async function createDb() {
  if (MONGODB_URI) {
    try {
      const mongoAdapter = new MongoDbAdapter();
      await mongoAdapter.read();
      return mongoAdapter;
    } catch (err) {
      console.error("MongoDB initialization failed, falling back to file DB:", err);
    }
  }

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
    try {
      await global.__phonefind_db__.read();
    } catch (e) {
      console.error("Failed db read:", e);
    }
  }
  return global.__phonefind_db__;
}
