import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/db";
import { getDeviceIdFromRequest } from "@/lib/auth";

/**
 * The phone app calls this every few minutes (and immediately on any
 * anomaly) with its cached location. capturedAt is set on-device at the
 * moment the location was read, so even if the ping only reaches the
 * server minutes later (spotty connectivity), we keep the true timestamp.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const { deviceId } = await params;
  const authedDeviceId = getDeviceIdFromRequest(req);
  if (!authedDeviceId || authedDeviceId !== deviceId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { latitude, longitude, batteryPct, capturedAt } = body ?? {};
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json(
      { error: "latitude and longitude (numbers) are required." },
      { status: 400 }
    );
  }

  const db = await getDb();
  const device = db.data.devices.find((d) => d.id === deviceId);
  if (!device) {
    return NextResponse.json({ error: "Device not found." }, { status: 404 });
  }

  const now = new Date().toISOString();
  db.data.locationPings.push({
    id: uuidv4(),
    deviceId,
    latitude,
    longitude,
    batteryPct: batteryPct ?? null,
    capturedAt: capturedAt ?? now,
    syncedAt: now,
  });
  device.lastSeenAt = now;

  await db.write();
  return NextResponse.json({ ok: true });
}
