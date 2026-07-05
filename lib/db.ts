import fs from "fs";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import mongoose from "mongoose";
import { PrismaClient } from "@prisma/client";
import { DbSchema, User, Device, LocationPing, DeviceEvent, Command } from "./types";
import { UserModel, DeviceModel, LocationPingModel, EventModel, CommandModel } from "./mongooseModels";

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_URL = process.env.DATABASE_URL;

class PostgresDbAdapter {
  data: DbSchema;
  prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.data = {
      users: [],
      devices: [],
      locationPings: [],
      events: [],
      commands: [],
    };
  }

  async read() {
    if (!DATABASE_URL) return;
    try {
      const [users, devices, locationPings, events, commands] = await Promise.all([
        this.prisma.user.findMany(),
        this.prisma.device.findMany(),
        this.prisma.locationPing.findMany(),
        this.prisma.deviceEvent.findMany(),
        this.prisma.command.findMany(),
      ]);

      this.data = {
        users: (users || []) as unknown as User[],
        devices: (devices || []) as unknown as Device[],
        locationPings: (locationPings || []) as unknown as LocationPing[],
        events: (events || []) as unknown as DeviceEvent[],
        commands: (commands || []) as unknown as Command[],
      };
    } catch (err) {
      console.error("PostgreSQL read error:", err);
    }
  }

  async write() {
    if (!DATABASE_URL) return;
    try {
      await Promise.all([
        ...this.data.users.map((u) =>
          this.prisma.user.upsert({
            where: { id: u.id },
            update: u,
            create: u,
          })
        ),
        ...this.data.devices.map((d) =>
          this.prisma.device.upsert({
            where: { id: d.id },
            update: d,
            create: d,
          })
        ),
        ...this.data.locationPings.map((l) =>
          this.prisma.locationPing.upsert({
            where: { id: l.id },
            update: l,
            create: l,
          })
        ),
        ...this.data.events.map((e) =>
          this.prisma.deviceEvent.upsert({
            where: { id: e.id },
            update: {
              deviceId: e.deviceId,
              type: e.type,
              metadata: e.metadata as unknown as Record<string, string>,
              createdAt: e.createdAt,
            },
            create: {
              id: e.id,
              deviceId: e.deviceId,
              type: e.type,
              metadata: e.metadata as unknown as Record<string, string>,
              createdAt: e.createdAt,
            },
          })
        ),
        ...this.data.commands.map((c) =>
          this.prisma.command.upsert({
            where: { id: c.id },
            update: c,
            create: c,
          })
        ),
      ]);
    } catch (err) {
      console.error("PostgreSQL write error:", err);
    }
  }
}

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
  if (DATABASE_URL) {
    try {
      const pgAdapter = new PostgresDbAdapter();
      await pgAdapter.read();
      return pgAdapter;
    } catch (err) {
      console.error("PostgreSQL connection failed, falling back to file DB:", err);
    }
  }

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
