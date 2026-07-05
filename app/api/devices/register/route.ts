import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/db";
import { getUserIdFromRequest, signDeviceKey } from "@/lib/auth";

/**
 * Called ONCE by the Android app right after the owner logs into their
 * platform account on the phone. Returns a long-lived device key that the
 * app stores locally and uses for all future requests (location pings,
 * command status updates) — completely separate from the owner's login.
 */
export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const imei = body?.imei;
  const deviceModel = body?.deviceModel;
  const fcmToken = body?.fcmToken ?? null;
  const simSerialHash = body?.simSerialHash ?? null;

  if (!imei || !deviceModel) {
    return NextResponse.json(
      { error: "imei and deviceModel are required." },
      { status: 400 }
    );
  }

  const db = await getDb();

  const existing = db.data.devices.find((d) => d.imei === imei && d.userId === userId);
  const device = existing ?? {
    id: uuidv4(),
    userId,
    imei,
    deviceModel,
    fcmToken,
    simSerialHash,
    lastSeenAt: new Date().toISOString(),
    status: "active" as const,
    createdAt: new Date().toISOString(),
  };

  if (existing) {
    existing.fcmToken = fcmToken;
    existing.simSerialHash = simSerialHash;
    existing.lastSeenAt = new Date().toISOString();
  } else {
    db.data.devices.push(device);
  }

  await db.write();

  const deviceKey = signDeviceKey(device.id);
  return NextResponse.json({ deviceId: device.id, deviceKey });
}
