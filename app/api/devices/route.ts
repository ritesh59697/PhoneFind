import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const db = await getDb();
  const devices = db.data.devices.filter((d) => d.userId === userId);

  // Attach each device's most recent location ping so the dashboard
  // can render a map without a second round trip per device.
  const withLocation = devices.map((device) => {
    const pings = db.data.locationPings
      .filter((p) => p.deviceId === device.id)
      .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
    return { ...device, lastLocation: pings[0] ?? null };
  });

  return NextResponse.json({ devices: withLocation });
}
