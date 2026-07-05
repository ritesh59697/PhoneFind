export interface User {
  id: string;
  email: string;
  passwordHash: string;
  backupContact: string | null;
  createdAt: string;
}

export interface Device {
  id: string;
  userId: string;
  imei: string;
  deviceModel: string;
  fcmToken: string | null;
  simSerialHash: string | null;
  lastSeenAt: string | null;
  status: "active" | "lost" | "locked" | "wiped";
  createdAt: string;
}

export interface LocationPing {
  id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  batteryPct: number | null;
  capturedAt: string;
  syncedAt: string;
}

export type EventType =
  | "sim_swap"
  | "failed_unlock"
  | "command_lock"
  | "command_wipe"
  | "ceir_reported";

export interface DeviceEvent {
  id: string;
  deviceId: string;
  type: EventType;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type CommandType = "lock" | "locate" | "alarm" | "wipe";
export type CommandStatus = "pending" | "delivered" | "executed" | "failed";

export interface Command {
  id: string;
  deviceId: string;
  type: CommandType;
  status: CommandStatus;
  issuedAt: string;
  executedAt: string | null;
}

export interface DbSchema {
  users: User[];
  devices: Device[];
  locationPings: LocationPing[];
  events: DeviceEvent[];
  commands: Command[];
}
