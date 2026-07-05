import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  backupContact: { type: String, default: null },
  createdAt: { type: String, required: true }
});

const DeviceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  imei: { type: String, required: true },
  deviceModel: { type: String, required: true },
  fcmToken: { type: String, default: null },
  simSerialHash: { type: String, default: null },
  lastSeenAt: { type: String, default: null },
  status: { type: String, default: "active" },
  createdAt: { type: String, required: true }
});

const LocationPingSchema = new Schema({
  id: { type: String, required: true, unique: true },
  deviceId: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  batteryPct: { type: Number, default: null },
  capturedAt: { type: String, required: true },
  syncedAt: { type: String, required: true }
});

const EventSchema = new Schema({
  id: { type: String, required: true, unique: true },
  deviceId: { type: String, required: true },
  type: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: String, required: true }
});

const CommandSchema = new Schema({
  id: { type: String, required: true, unique: true },
  deviceId: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, default: "pending" },
  issuedAt: { type: String, required: true },
  executedAt: { type: String, default: null }
});

export const UserModel = models.User || model("User", UserSchema);
export const DeviceModel = models.Device || model("Device", DeviceSchema);
export const LocationPingModel = models.LocationPing || model("LocationPing", LocationPingSchema);
export const EventModel = models.Event || model("Event", EventSchema);
export const CommandModel = models.Command || model("Command", CommandSchema);
