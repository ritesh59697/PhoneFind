import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/db";
import { getDeviceIdFromRequest } from "@/lib/auth";

/**
 * The phone app calls this on boot and periodically, passing a HASH of
 * the current SIM serial (never the raw serial — we don't need it, and
 * hashing avoids storing something sensitive unnecessarily).
 *
 * If it differs from what's on file, this is our earliest and strongest
 * signal of theft: it fires BEFORE the owner even notices the phone is
 * missing, in most snatch-and-resell scenarios. Google's Find My Device
 * has no equivalent to this.
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
  const currentSimSerialHash = body?.simSerialHash;
  if (!currentSimSerialHash) {
    return NextResponse.json(
      { error: "simSerialHash is required." },
      { status: 400 }
    );
  }

  const db = await getDb();
  const device = db.data.devices.find((d) => d.id === deviceId);
  if (!device) {
    return NextResponse.json({ error: "Device not found." }, { status: 404 });
  }

  // First check ever recorded — just store it as the baseline, not a swap.
  if (!device.simSerialHash) {
    device.simSerialHash = currentSimSerialHash;
    await db.write();
    return NextResponse.json({ swapDetected: false });
  }

  const swapDetected = device.simSerialHash !== currentSimSerialHash;

  if (swapDetected) {
    db.data.events.push({
      id: uuidv4(),
      deviceId,
      type: "sim_swap",
      metadata: {
        previousHash: device.simSerialHash,
        newHash: currentSimSerialHash,
      },
      createdAt: new Date().toISOString(),
    });
    device.simSerialHash = currentSimSerialHash;
    device.status = "lost";

    // TODO once you wire up an email/SMS provider (e.g. Resend, Twilio):
    // look up the owner's backupContact and notify them immediately here,
    // attaching the device's most recent location ping if one exists.
  }

  await db.write();
  return NextResponse.json({ swapDetected });
}
