import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getDeviceIdFromRequest } from "@/lib/auth";

/**
 * Phone calls this right after executing a lock/locate/alarm/wipe command,
 * so the dashboard can flip from "Sending..." to "Locked ✓" instead of
 * guessing based on a timeout.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ commandId: string }> }
) {
  const { commandId } = await params;
  const authedDeviceId = getDeviceIdFromRequest(req);
  if (!authedDeviceId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (!["executed", "failed"].includes(status)) {
    return NextResponse.json(
      { error: "status must be executed or failed." },
      { status: 400 }
    );
  }

  const db = await getDb();
  const command = db.data.commands.find(
    (c) => c.id === commandId && c.deviceId === authedDeviceId
  );
  if (!command) {
    return NextResponse.json({ error: "Command not found." }, { status: 404 });
  }

  command.status = status;
  command.executedAt = new Date().toISOString();
  await db.write();

  return NextResponse.json({ command });
}
