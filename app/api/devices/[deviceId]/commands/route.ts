import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/db";
import { getUserIdFromRequest, getDeviceIdFromRequest } from "@/lib/auth";
import { sendCommandPush } from "@/lib/fcm";

/**
 * POST: the owner's dashboard calls this to issue a command.
 * We write it to the queue first (so we never lose a command even if the
 * push fails), then attempt an FCM push immediately. If the phone is
 * offline, the command just sits as "pending" until the phone polls or
 * FCM redelivers once connectivity returns.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const { deviceId } = await params;
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const type = body?.type;
  if (!["lock", "locate", "alarm", "wipe"].includes(type)) {
    return NextResponse.json(
      { error: "type must be one of lock, locate, alarm, wipe." },
      { status: 400 }
    );
  }

  const db = await getDb();
  const device = db.data.devices.find((d) => d.id === deviceId && d.userId === userId);
  if (!device) {
    return NextResponse.json({ error: "Device not found." }, { status: 404 });
  }

  const command: {
    id: string;
    deviceId: string;
    type: "lock" | "locate" | "alarm" | "wipe";
    status: "pending" | "delivered" | "executed" | "failed";
    issuedAt: string;
    executedAt: string | null;
  } = {
    id: uuidv4(),
    deviceId,
    type: type as "lock" | "locate" | "alarm" | "wipe",
    status: "pending",
    issuedAt: new Date().toISOString(),
    executedAt: null,
  };
  db.data.commands.push(command);

  if (type === "lock" || type === "wipe") {
    db.data.events.push({
      id: uuidv4(),
      deviceId,
      type: type === "lock" ? "command_lock" : "command_wipe",
      metadata: {},
      createdAt: new Date().toISOString(),
    });
  }

  await db.write();

  if (device.fcmToken) {
    try {
      await sendCommandPush({
        fcmToken: device.fcmToken,
        commandId: command.id,
        type: command.type,
      });
      command.status = "delivered";
      await db.write();
    } catch (err) {
      // Push failed (e.g. Firebase not configured yet, or stale token) —
      // command stays "pending" and the phone can still pick it up via
      // GET polling below once it's back online.
      console.error("FCM push failed:", err);
    }
  }

  return NextResponse.json({ command });
}

/**
 * GET: the phone app polls this as a fallback in case a push was missed
 * (e.g. app was force-killed, token rotated). Returns anything still
 * pending or delivered-but-not-yet-executed.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const { deviceId } = await params;
  const authedDeviceId = getDeviceIdFromRequest(req);
  if (!authedDeviceId || authedDeviceId !== deviceId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const db = await getDb();
  const commands = db.data.commands.filter(
    (c) => c.deviceId === deviceId && c.status !== "executed" && c.status !== "failed"
  );
  return NextResponse.json({ commands });
}
