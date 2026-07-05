import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

// In production, set this via environment variable (e.g. Vercel project settings).
// Never commit a real secret to source control.
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

/**
 * Pulls the userId out of a request's Authorization: Bearer <token> header.
 * Used by every protected API route (dashboard calls, device calls).
 */
export function getUserIdFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length);
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

/**
 * Devices authenticate differently from the dashboard: they present a
 * long-lived device API key issued at registration, not a user JWT.
 * This keeps a phone's credential compromise separate from the owner's
 * account credential.
 */
export function signDeviceKey(deviceId: string) {
  return jwt.sign({ deviceId }, JWT_SECRET, { expiresIn: "3650d" });
}

export function verifyDeviceKey(token: string): { deviceId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { deviceId: string };
  } catch {
    return null;
  }
}

export function getDeviceIdFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length);
  const payload = verifyDeviceKey(token);
  return payload?.deviceId ?? null;
}
